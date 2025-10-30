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
} from '@src/mbus-protocol';
import { bcdDecode, manufacturerToString, variableMediumToString } from './string-lookup';

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

  async discardFrames(): Promise<void> {
    while (true) {
      const [result] = await this.serial.receiveFrame();

      if (![ReceiveResultCode.OK, ReceiveResultCode.INVALID].includes(result)) {
        break;
      }
    }
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
      signature: `${header.signature[1].toString(16).padStart(2, '0')}${header.signature[0].toString(16).padStart(2, '0')}`,
    };
  }
  private variableRecordToObject(record: MbusDataRecord) {}

  public isPrimaryAddress(address: number): boolean {
    return address >= 0x0 && address <= 0xff;
  }
}
