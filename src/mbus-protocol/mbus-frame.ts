/*
 * Portions of this file are derived from libmbus.
 *
 * Original work:
 *   Copyright (c) 2010–2012, Raditex AB
 *   Licensed under the BSD 3-Clause License.
 *
 * Modifications and TypeScript translation:
 *   Copyright (c) 2026, SenseNode AB
 */

export enum FrameType {
  ANY = 0x00,
  ACK = 0x01,
  SHORT = 0x02,
  CONTROL = 0x03,
  LONG = 0x04,
}

export enum FrameStartStopBits {
  ACK_START = 0xe5,
  SHORT_START = 0x10,
  CONTROL_START = 0x68,
  LONG_START = 0x68,
  STOP = 0x16,
}

export enum FrameControlField {
  DIRECTION = 0x07,
  FCB = 0x06,
  ACD = 0x06,
  FCV = 0x05,
  DFC = 0x05,
  F3 = 0x04,
  F2 = 0x03,
  F1 = 0x02,
  F0 = 0x01,
}

export enum FrameControlMask {
  SND_NKE = 0x40,
  SND_UD = 0x53,
  REQ_UD2 = 0x5b,
  REQ_UD1 = 0x5a,
  RSP_UD = 0x08,
  FCB = 0x20,
  FCV = 0x10,
  ACD = 0x20,
  DFC = 0x10,
  DIR = 0x40,
  DIR_M2S = 0x40,
  DIR_S2M = 0x00,
}

export enum ControlInfo {
  DATA_SEND = 0x51,
  DATA_SEND_MSB = 0x55,
  SELECT_SLAVE = 0x52,
  SELECT_SLAVE_MSB = 0x56,
  APPLICATION_RESET = 0x50,
  SYNC_ACTION = 0x54,
  SET_BAUDRATE_300 = 0xb8,
  SET_BAUDRATE_600 = 0xb9,
  SET_BAUDRATE_1200 = 0xba,
  SET_BAUDRATE_2400 = 0xbb,
  SET_BAUDRATE_4800 = 0xbc,
  SET_BAUDRATE_9600 = 0xbd,
  SET_BAUDRATE_19200 = 0xbe,
  SET_BAUDRATE_38400 = 0xbf,
  REQUEST_RAM_READ = 0xb1,
  SEND_USER_DATA = 0xb2,
  INIT_TEST_CALIB = 0xb3,
  EEPROM_READ = 0xb4,
  SW_TEST_START = 0xb6,

  //Mode 1 Mode 2                   Application                   Definition in
  // 70h             report of general application errors     Usergroup March 94
  // 71h                      report of alarm status          Usergroup March 94
  // 72h   76h                variable data respond                EN1434-3
  // 73h   77h                 fixed data respond                  EN1434-3
  ERROR_GENERAL = 0x70,
  STATUS_ALARM = 0x71,
  RESP_FIXED = 0x73,
  RESP_FIXED_MSB = 0x77,
  RESP_VARIABLE = 0x72,
  RESP_VARIABLE_MSB = 0x76,
}

export enum MbusDataType {
  // TODO Convert whole data frame to conditional type
  FIXED = 1,
  VARIABLE = 2,
  ERROR = 3,
}

export enum MbusDataRecordDifMask {
  INST = 0x00,
  MIN = 0x10,
  TYPE_INT32 = 0x04,
  DATA = 0x0f,
  FUNCTION = 0x30,
  STORAGE_NO = 0x40,
  EXTENTION = 0x80,
  NON_DATA = 0xf0,
}

export enum MbusDataRecordDifeMask {
  STORAGE_NO = 0x0f,
  TARIFF = 0x30,
  DEVICE = 0x40,
  EXTENSION = 0x80,
}

const MBUS_FRAME_BASE_SIZE_SHORT = 5;
const MBUS_FRAME_FIXED_SIZE_LONG = 6;

// DATA RECORDS
export enum MbusDibVif {
  WITHOUT_EXTENSION = 0x7f,
  EXTENSION_BIT = 0x80,
}

export enum MbusDibDif {
  WITHOUT_EXTENSION = 0x7f,
  EXTENSION_BIT = 0x80,
  MANUFACTURER_SPECIFIC = 0x0f,
  MORE_RECORDS_FOLLOW = 0x1f,
  IDLE_FILLER = 0x2f, // DATA RECORDS
}

const MBUS_DATA_INFO_BLOCK_DIFE_SIZE = 10;
const MBUS_VALUE_INFO_BLOCK_VIFE_SIZE = 10;
const MBUS_VALUE_INFO_BLOCK_CUSTOM_VIF_SIZE = 128;

export type MbusDataInformationBlock = {
  dif: number;
  dife: number[];
};

export type MbusValueInformationBlock = {
  vif: number;
  vife: number[];
  customVif: number[];
};

export type MbusDataRecordHeader = {
  dib: MbusDataInformationBlock;
  vib: MbusValueInformationBlock;
};

export type MbusDataRecord = {
  header: MbusDataRecordHeader;
  data: Buffer;
  timestamp: Date;
};

export type MbusDataVariableHeader = {
  id_bcd: number[];
  manufacturer: number[];
  version: number;
  medium: number;
  access_no: number;
  status: number;
  signature: number[];
};

export type MbusDataVariable = {
  header?: MbusDataVariableHeader;
  records: MbusDataRecord[];
  data: Buffer;
  moreRecordsFollow: boolean;
};
export type MbusDataFixed = {};

export type MbusFrameData = {
  variable?: MbusDataVariable;
  fixed?: MbusDataFixed;
  type?: number;
  error?: number;
};

export class MbusFrame {
  public type: FrameType;

  public start1: number = 0;
  public length1: number = 0;
  public length2: number = 0;
  public start2: number = 0;
  public control: number = 0;
  public address: number = 0;
  public controlInformation: number = 0;
  public checksum: number = 0;
  public stop: number = 0;

  public data: Buffer;
  public dataLen: number = 0;

  public timestamp: Date;

  public next: MbusFrame | undefined;

  public constructor(frameType: FrameType = FrameType.ANY) {
    this.type = frameType;
    this.data = Buffer.alloc(252);

    switch (frameType) {
      case FrameType.ACK:
        this.start1 = FrameStartStopBits.ACK_START;
        break;
      case FrameType.SHORT:
        this.start1 = FrameStartStopBits.SHORT_START;
        this.stop = FrameStartStopBits.STOP;
        break;
      case FrameType.CONTROL:
        this.start1 = FrameStartStopBits.CONTROL_START;
        this.start2 = FrameStartStopBits.CONTROL_START;
        this.length1 = 3;
        this.length2 = 3;
        this.stop = FrameStartStopBits.STOP;
        break;
      case FrameType.LONG:
        this.start1 = FrameStartStopBits.LONG_START;
        this.start2 = FrameStartStopBits.LONG_START;
        this.stop = this.stop = FrameStartStopBits.STOP;
        break;
    }

    this.timestamp = new Date();
  }

  isLengthValid(): boolean {
    return this.length1 === this.length2 && this.length1 === this.calculateLength();
  }

  isChecksumValid(): boolean {
    return this.checksum === this.calculateChecksum();
  }

  isDirectionM2S(): boolean {
    return this.type == FrameType.ACK ? false : (this.control & FrameControlMask.DIR) > 0 ? true : false;
  }

  private calculateChecksum() {
    let checksum = 0;

    switch (this.type) {
      case FrameType.SHORT:
        checksum = this.control;
        checksum += this.address;
        break;
      case FrameType.CONTROL:
        checksum = this.control;
        checksum += this.address;
        checksum += this.controlInformation;
        break;
      case FrameType.LONG:
        checksum = this.control;
        checksum += this.address;
        checksum += this.controlInformation;

        for (let i = 0; i < this.dataLen; i++) {
          checksum += this.data[i];
        }
        break;
      case FrameType.ACK:
      default:
        checksum = 0;
    }

    return checksum & 0xff;
  }

  private calculateLength(): number {
    switch (this.type) {
      case FrameType.CONTROL:
        return 3;
      case FrameType.LONG:
        return this.dataLen + 3;
      default:
        return 0;
    }
  }

  pack(): Buffer | null {
    this.length1 = this.length2 = this.calculateLength();

    if (![FrameType.ACK, FrameType.SHORT, FrameType.CONTROL, FrameType.LONG].includes(this.type)) {
      return null;
    }

    this.checksum = this.calculateChecksum();

    let buffer = Buffer.alloc(this.data.length);

    switch (this.type) {
      case FrameType.ACK:
        buffer[0] = this.start1;
        buffer = buffer.subarray(0, 1);

        break;
      case FrameType.SHORT:
        buffer[0] = this.start1;
        buffer[1] = this.control;
        buffer[2] = this.address;
        buffer[3] = this.checksum;
        buffer[4] = this.stop;
        buffer = buffer.subarray(0, 5);

        break;
      case FrameType.CONTROL:
        buffer[0] = this.start1;
        buffer[1] = this.length1;
        buffer[2] = this.length2;
        buffer[3] = this.start2;
        buffer[4] = this.control;
        buffer[5] = this.address;
        buffer[6] = this.controlInformation;

        buffer[7] = this.checksum;
        buffer[8] = this.stop;

        buffer = buffer.subarray(0, 8);

        break;
      case FrameType.LONG:
        let offset = 0;

        buffer[offset++] = this.start1;
        buffer[offset++] = this.length1;
        buffer[offset++] = this.length2;
        buffer[offset++] = this.start2;
        buffer[offset++] = this.control;
        buffer[offset++] = this.address;
        buffer[offset++] = this.controlInformation;

        for (let i = 0; i < this.dataLen; i++) {
          buffer[offset++] = this.data[i];
        }

        buffer[offset++] = this.checksum;
        buffer[offset++] = this.stop;

        buffer = buffer.subarray(0, offset);

        break;
      default:
        return null;
    }

    return buffer;
  }

  verifyAndParse(): MbusFrameData | null {
    const direction = this.control & FrameControlMask.DIR;
    const data: MbusFrameData = {};

    if (direction == FrameControlMask.DIR_S2M) {
      if (this.controlInformation == ControlInfo.ERROR_GENERAL) {
        data.type = MbusDataType.ERROR;

        if (this.dataLen > 0) {
          data.error = (this.data[3] << 24) | (this.data[2] << 16) | (this.data[1] << 8) | this.data[0];
        } else {
          data.error = 0;
        }

        return data;
      } else if (this.controlInformation == ControlInfo.RESP_FIXED) {
        if (this.dataLen === 0) {
          console.error('Got zero data_size');

          return null;
        }

        data.type = MbusDataType.FIXED;

        const fixed = this.parseFixed();
        if (fixed === null) {
          return null;
        }

        data.fixed = fixed;

        return data;
      } else if (this.controlInformation == ControlInfo.RESP_VARIABLE) {
        if (this.dataLen === 0) {
          console.error('Got zero data_size');

          return null;
        }

        data.type = MbusDataType.VARIABLE;

        const variable = this.parseVariable();
        if (variable === null) {
          return null;
        }

        data.variable = variable;

        return data;
      } else {
        console.error(`Unknown control information ${this.controlInformation}`);

        return null;
      }
    }

    console.error('Wrong direction in frame (master to slave)');

    return null;
  }

  private parseFixed(): MbusDataFixed | null {
    if (this.dataLen !== 16) {
      // MBUS_DATA_FIXED_LENGTH
      console.error('Invalid length for fixed data');

      return null;
    }

    return {
      id_bcd: [this.data[0], this.data[1], this.data[2], this.data[3]],
      tx_cnt: this.data[4],
      status: this.data[6],
      cnt1_type: this.data[7],
      cnt2_type: this.data[8],
      cnt1_val: [
        this.data[9],
        this.data[10],
        this.data[11],
        this.data[12],
        this.data[13],
        this.data[14],
        this.data[15],
      ],
    } as MbusDataFixed;
  }

  private parseVariable(): MbusDataVariable | null {
    const variable: MbusDataVariable = {
      records: [],
      data: Buffer.alloc(this.dataLen), // XXX
      moreRecordsFollow: false,
    };
    let i;

    // parse header
    i = 12; //MBUS_DATA_VARIABLE_HEADER_LENGTH;

    if (this.dataLen < i) {
      console.error('Variable header too short');
      return null;
    }

    // first copy the variable data fixed header bytewise
    variable.header = {
      id_bcd: [this.data[0], this.data[1], this.data[2], this.data[3]],
      manufacturer: [this.data[4], this.data[5]],
      version: this.data[6],
      medium: this.data[7],
      access_no: this.data[8],
      status: this.data[9],
      signature: [this.data[10], this.data[11]],
    } as MbusDataVariableHeader;

    while (i < this.dataLen) {
      // Skip filler dif=2F
      if ((this.data[i] & 0xff) === MbusDibDif.IDLE_FILLER) {
        i++;
        continue;
      }

      const record = {} as MbusDataRecord;
      record.header = {
        dib: {},
        vib: {},
      } as MbusDataRecordHeader;

      // copy timestamp
      record.timestamp = this.timestamp;

      // read and parse DIB (= DIF + DIFE)

      // DIF
      record.header.dib.dif = this.data[i];

      if (
        record.header.dib.dif === MbusDibDif.MANUFACTURER_SPECIFIC ||
        record.header.dib.dif === MbusDibDif.MORE_RECORDS_FOLLOW
      ) {
        if ((record.header.dib.dif & 0xff) === MbusDibDif.MORE_RECORDS_FOLLOW) {
          variable.moreRecordsFollow = true;
        }

        i++;
        // just copy the remaining data as it is vendor specific
        record.data = Buffer.alloc(this.dataLen - i);
        for (let j = 0; j < record.data.length; j++) {
          record.data[j] = this.data[i++];
        }

        // append the record and move on to next one
        variable.records.push(record);

        continue;
      }

      // calculate length of data record
      let recordDataLen = this.difLengthLookup(record.header.dib.dif);

      // read DIF extensions
      let difeCount = 0;
      const difeArray = [];

      while (i < this.dataLen && this.data[i] & MbusDibDif.EXTENSION_BIT) {
        if (difeCount >= MBUS_DATA_INFO_BLOCK_DIFE_SIZE) {
          console.error('Too many DIFE');
          return null;
        }

        difeArray.push(this.data[i + 1]);

        difeCount++;
        i++;
      }
      record.header.dib.dife = difeArray;
      i++;

      if (i > this.dataLen) {
        console.error('Premature end of record at DIF');
        return null;
      }

      // read and parse VIB (= VIF + VIFE)

      // VIF
      record.header.vib.vif = this.data[i++];

      if ((record.header.vib.vif & MbusDibVif.WITHOUT_EXTENSION) === 0x7c) {
        // variable length VIF in ASCII format
        let vifLen = this.data[i++];

        if (vifLen > MBUS_VALUE_INFO_BLOCK_CUSTOM_VIF_SIZE) {
          console.error('Too long variable length VIF');
          return null;
        }

        if (i + vifLen > this.dataLen) {
          console.error('Premature end of record at variable length VIF');
          return null;
        }
        record.header.vib.customVif = this.strDecode(i, vifLen);
        i += vifLen;
      }

      // VIFE
      let vifeCount = 0;
      const vifeArray = [];

      if (record.header.vib.vif & MbusDibVif.EXTENSION_BIT) {
        vifeArray.push(this.data[i]);
        vifeCount++;

        while (i < this.dataLen && this.data[i] & MbusDibVif.EXTENSION_BIT) {
          if (vifeCount >= MBUS_VALUE_INFO_BLOCK_VIFE_SIZE) {
            console.error('Too many VIFE');
            return null;
          }

          vifeArray.push(this.data[i + 1]);

          vifeCount++;
          i++;
        }

        record.header.vib.vife = vifeArray;
        i++;
      }

      if (i > this.dataLen) {
        console.error('Premature end of record at VIF');

        return null;
      }

      // re-calculate data length, if of variable length type
      if ((record.header.dib.dif & MbusDataRecordDifMask.DATA) === 0x0d) {
        // flag for variable length data
        if (this.data[i] <= 0xbf) {
          recordDataLen = this.data[i];
        } else if (this.data[i] >= 0xc0 && this.data[i] <= 0xc9) {
          recordDataLen = (this.data[i] - 0xc0) * 2;
        } else if (this.data[i] >= 0xd0 && this.data[i] <= 0xd9) {
          recordDataLen = (this.data[i] - 0xd0) * 2;
        } else if (this.data[i] >= 0xe0 && this.data[i] <= 0xef) {
          recordDataLen = this.data[i] - 0xe0;
        } else if (this.data[i] >= 0xf0 && this.data[i] <= 0xf4) {
          recordDataLen = (this.data[i] - 0xec) * 4;
        } else if (this.data[i] == 0xf5) {
          recordDataLen = 48;
        } else if (this.data[i] == 0xf6) {
          recordDataLen = 64;
        }
        // keep the LVAR byte, which is required to determine the data type
        recordDataLen++;
      }

      if (i + recordDataLen > this.dataLen) {
        console.error('Premature end of record at data');

        return null;
      }

      record.data = Buffer.alloc(recordDataLen);

      // copy data
      this.data.copy(record.data, 0, i, i + record.data.length);
      i += record.data.length;

      // append the record and move on to next one
      variable.records.push(record);
    }

    return variable;
  }

  private strDecode(startIndex: number, length: number): number[] {
    const a: number[] = [];

    while (length > 0) {
      a.push(this.data[startIndex + --length]);
    }

    a.push(0);

    return a;
  }

  private difLengthLookup(dif: number): number {
    switch (dif & MbusDataRecordDifMask.DATA) {
      case 0x0:
        return 0;
      case 0x1:
        return 1;
      case 0x2:
        return 2;
      case 0x3:
        return 3;
      case 0x4:
        return 4;
      case 0x5:
        return 4;
      case 0x6:
        return 6;
      case 0x7:
        return 8;
      case 0x8:
        return 0;
      case 0x9:
        return 1;
      case 0xa:
        return 2;
      case 0xb:
        return 3;
      case 0xc:
        return 4;

      case 0xd:
        // variable data length,
        // data length stored in data field
        return 0;
      case 0xe:
        return 6;
      case 0xf:
        return 8;
      default: // never reached
        return 0x00;
    }
  }

  importData(buffer: Buffer, dataLength: number): number {
    let i = 0;

    if (buffer && dataLength > 0) {
      this.next = undefined;

      switch (buffer[0]) {
        case FrameStartStopBits.ACK_START:
          // OK, got a valid ack frame, require no more data
          this.start1 = buffer[0];
          this.type = FrameType.ACK;
          return 0;
        case FrameStartStopBits.SHORT_START:
          if (dataLength < MBUS_FRAME_BASE_SIZE_SHORT) {
            // OK, got a valid short packet start, but we need more data
            return MBUS_FRAME_BASE_SIZE_SHORT - dataLength;
          }

          if (dataLength != MBUS_FRAME_BASE_SIZE_SHORT) {
            // too much data in frame
            return -2;
          }

          // init frame data structure
          this.start1 = buffer[0];
          this.control = buffer[1];
          this.address = buffer[2];
          this.checksum = buffer[3];
          this.stop = buffer[4];

          this.type = FrameType.SHORT;

          // verify the frame
          if (!this.verify()) {
            return -3;
          }

          // successfully parsed data
          return 0;
        case FrameStartStopBits.LONG_START: // (also CONTROL)
          if (dataLength < 3) {
            // OK, got a valid long/control packet start, but we need
            // more data to determine the length
            return 3 - dataLength;
          }

          // init frame data structure
          this.start1 = buffer[0];
          this.length1 = buffer[1];
          this.length2 = buffer[2];

          if (this.length1 < 3) {
            // Invalid M-Bus frame length
            return -2;
          }

          if (this.length1 != this.length2) {
            // Invalid M-Bus frame length
            return -2;
          }

          // Check length of packet:
          if (dataLength < MBUS_FRAME_FIXED_SIZE_LONG + this.length1) {
            // OK, but we need more data
            return MBUS_FRAME_FIXED_SIZE_LONG + this.length1 - dataLength;
          }

          if (dataLength > MBUS_FRAME_FIXED_SIZE_LONG + this.length1) {
            // Too much data...
            return -2;
          }

          // We got the whole packet, continue parsing
          this.start2 = buffer[3];
          this.control = buffer[4];
          this.address = buffer[5];
          this.controlInformation = buffer[6];

          this.dataLen = this.length1 - 3;
          for (i = 0; i < this.dataLen; i++) {
            this.data[i] = buffer[7 + i];
          }
          this.data = this.data.subarray(0, this.dataLen);

          this.checksum = buffer[dataLength - 2]; // buffer[6 + this.dataLength + 1]
          this.stop = buffer[dataLength - 1]; // buffer[6 + this.dataLength + 2]

          if (this.dataLen == 0) {
            this.type = FrameType.CONTROL;
          } else {
            this.type = FrameType.LONG;
          }

          // verify the frame
          if (!this.verify()) {
            return -3;
          }

          // successfully parsed data
          return 0;
        default:
          // Invalid M-Bus frame start
          return -4;
      }
    }

    return -1;
  }

  private verify(): boolean {
    switch (this.type) {
      case FrameType.ACK:
        return this.start1 === FrameStartStopBits.ACK_START;
      case FrameType.SHORT:
        if (this.start1 != FrameStartStopBits.SHORT_START) {
          // No frame start
          return false;
        }

        if (
          ![
            FrameControlMask.SND_NKE,
            FrameControlMask.REQ_UD1,
            FrameControlMask.REQ_UD1 | FrameControlMask.FCB,
            FrameControlMask.REQ_UD2,
            FrameControlMask.REQ_UD2 | FrameControlMask.FCB,
          ].includes(this.control)
        ) {
          // Unknown control code
          return false;
        }

        break;
      case FrameType.CONTROL:
      case FrameType.LONG:
        if (this.start1 != FrameStartStopBits.CONTROL_START || this.start2 != FrameStartStopBits.CONTROL_START) {
          // No frame start
          return false;
        }

        if (
          ![
            FrameControlMask.SND_UD,
            FrameControlMask.SND_UD | FrameControlMask.FCB,
            FrameControlMask.RSP_UD,
            FrameControlMask.RSP_UD | FrameControlMask.DFC,
            FrameControlMask.SND_UD | FrameControlMask.ACD,
            FrameControlMask.RSP_UD | FrameControlMask.DFC | FrameControlMask.ACD,
          ].includes(this.control)
        ) {
          // Unknown control code
          return false;
        }

        if (this.length1 != this.length2) {
          // Frame length mismatch
          return false;
        }

        if (this.length1 !== this.calculateLength()) {
          // Frame length1 not matching calculated length
          return false;
        }

        break;

      default:
        // Unknown frame type
        return false;
    }

    if (this.stop != FrameStartStopBits.STOP) {
      // No frame stop
      return false;
    }

    if (!this.isChecksumValid()) {
      // Invalid checksum
      return false;
    }

    return true;
  }
}
