import { MbusSerial, PurgeStrategy, ReceiveResultCode } from '@src/mbus-serial/';
import {
  FrameControlMask,
  FrameType,
  MbusDataType,
  MbusDataVariable,
  MbusDataVariableHeader,
  MbusDataRecord,
  MbusFrame,
  MbusFrameData,
  MbusDibDif,
  FrameControlField,
} from '@src/mbus-protocol';
import {
  bcdDecode,
  manufacturerToString,
  recordDevice,
  recordFunctionToString,
  recordStorageNumber,
  recordTariff,
  recordUnitString,
  recordUnitToFactorAndQuantity,
  recordValueNumber,
  toHex,
  variableMediumToString,
} from './string-lookup';

export class MbusProtocol {
  private serial: MbusSerial;

  constructor(serial: MbusSerial) {
    this.serial = serial;
  }

  async sendRequestFrame(address: number): Promise<boolean> {
    if (!this.isPrimaryAddress(address)) {
      return false;
    }

    const frame = new MbusFrame(FrameType.SHORT);

    frame.control = FrameControlMask.REQ_UD2 | FrameControlMask.DIR_M2S;
    frame.address = address;

    return this.serial.sendFrame(frame);
  }

  async sendReqestAndReceiveMultiple(address: number, maxNbrFrames: number): Promise<[ReceiveResultCode, MbusFrame[]]> {
    let retry = 0;
    let moreFrames = true;

    const frame = new MbusFrame(FrameType.SHORT);
    frame.control = FrameControlMask.REQ_UD2 | FrameControlMask.DIR_M2S | FrameControlMask.FCV | FrameControlMask.FCB;
    frame.address = address;

    // continue to read until no more records are available (usually only one
    // reply frame, but can be more for so-called multi-telegram replies)

    const frames: MbusFrame[] = [];

    while (moreFrames) {
      if (retry > 3) {
        // Origin is mbus_handle.max_data_retry
        // Give up
        return [ReceiveResultCode.TIMEOUT, []];
      }

      if (!(await this.serial.sendFrame(frame))) {
        console.error('Failed to send mbus frame.');
        return [ReceiveResultCode.ERROR, []];
      }

      const [code, replyFrame] = await this.serial.receiveFrame();

      if (code === ReceiveResultCode.OK && replyFrame) {
        frames.push(replyFrame);
        retry = 0;
      } else if (code === ReceiveResultCode.TIMEOUT) {
        console.error('No M-Bus response frame received');
        retry++;
        continue;
      } else if (code === ReceiveResultCode.INVALID) {
        console.error('Received invalid M-Bus response frame');
        retry++;
        continue;
      } else {
        console.error('Failed to receive M-Bus response frame');
        return [ReceiveResultCode.ERROR, []];
      }

      // We need to parse the data in the received frame to be able to tell
      // if more records are available or not.
      const mbusFrameData = replyFrame?.verifyAndParse();

      if (!mbusFrameData) {
        console.error('M-bus data parse error');
        return [ReceiveResultCode.ERROR, []];
      }

      // Continue a cycle of sending requests and reading replies until the
      // reply do not have DIF=0x1F in the last record (which signals that
      // more records are available.

      if (mbusFrameData.type != MbusDataType.VARIABLE) {
        // only single frame replies for FIXED type frames
        moreFrames = false;
      } else {
        moreFrames = false;

        if (mbusFrameData.variable?.moreRecordsFollow && maxNbrFrames > 0 && frames.length < maxNbrFrames) {
          // only readout max_frames
          moreFrames = true;

          // allocate new frame and increment next_frame pointer

          // toogle FCB bit
          frame.control ^= FrameControlField.FCB;
        }
      }
    }

    return [ReceiveResultCode.OK, frames];
  }

  async sendPingFrame(address: number, discardResponse: boolean): Promise<boolean> {
    if (!this.isPrimaryAddress(address)) {
      return false;
    }

    const frame = new MbusFrame(FrameType.SHORT);
    frame.control = FrameControlMask.SND_NKE | FrameControlMask.DIR_M2S;
    frame.address = address;

    await this.serial.sendFrame(frame);

    if (discardResponse) {
      await this.discardFrames();
    }

    return true;
  }

  async discardFrames(): Promise<boolean> {
    let gotFrame = false;

    while (true) {
      const [result] = await this.serial.receiveFrame();

      if (![ReceiveResultCode.OK, ReceiveResultCode.INVALID].includes(result)) {
        break;
      }

      gotFrame = true;
    }

    return gotFrame;
  }

  async receiveFrame(): Promise<[ReceiveResultCode, MbusFrame | undefined]> {
    let [result, frame] = await this.serial.receiveFrame();

    if (result === ReceiveResultCode.OK && frame) {
      if (frame.isDirectionM2S()) {
        if (this.serial.purge === PurgeStrategy.FIRST_M2S) {
          [result, frame] = await this.serial.receiveFrame();
        }
      } else {
        if (this.serial.purge === PurgeStrategy.FIRST_S2M) {
          [result, frame] = await this.serial.receiveFrame();
        }
      }
    }

    return [result, frame];
  }

  mbusFrameDataToObject(data: MbusFrameData) {
    switch (data.type) {
      case MbusDataType.ERROR:
        return null;
      case MbusDataType.FIXED:
        return this.fixedToObject(data);
      case MbusDataType.VARIABLE:
        return this.variableToObject(data.variable);
    }

    return null;
  }

  private fixedToObject(data: MbusFrameData): any {}

  private variableToObject(data: MbusDataVariable | undefined): any {
    if (!data) {
      return {};
    }

    const obj = {};

    const header = this.variableHeaderToObject(data.header);

    const records = data.records.map((record) => {
      return this.variableRecordToObject(record);
    });

    return { header, records };
  }

  private variableHeaderToObject(header: MbusDataVariableHeader | undefined) {
    if (!header) {
      return {};
    }

    return {
      id: bcdDecode(header.id_bcd),
      manufacturer: manufacturerToString(header.manufacturer),
      version: header.version,
      productName: '', // TODO, is it meaningful to port the original outdated implementation?
      medium: variableMediumToString(header.medium),
      accessNumber: header.access_no,
      status: header.status,
      signature: `${toHex(header.signature[1])}${toHex(header.signature[0])}`,
    };
  }

  private variableRecordToObject(record: MbusDataRecord) {
    if (record.header.dib.dif === MbusDibDif.MANUFACTURER_SPECIFIC) {
      return { function: 'Manufacturer specific' };
    } else if (record.header.dib.dif === MbusDibDif.MORE_RECORDS_FOLLOW) {
      return { function: 'More records follow' };
    } else {
      const tariff = recordTariff(record);

      const tariffData = tariff >= 0 ? { tariff: tariff, device: recordDevice(record) } : {};
      const timestampData = record.timestamp ? { timestamp: record.timestamp.toISOString() } : {};

      const value = recordValueNumber(record);
      let scaledValueData = {};
      if (typeof value === 'number') {
        const [factor, quantity] = recordUnitToFactorAndQuantity(record.header.vib);
        if (factor !== undefined) {
          scaledValueData = { scaledValue: value * factor, baseUnit: quantity };
        }
      }

      return {
        function: recordFunctionToString(record.header.dib),
        storageNumber: recordStorageNumber(record),
        unit: recordUnitString(record.header.vib),
        value: value,
        ...tariffData,
        ...timestampData,
        ...scaledValueData,
      };
    }
  }

  public isPrimaryAddress(address: number): boolean {
    return address >= 0x0 && address <= 0xff;
  }
}
