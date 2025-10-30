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

  public isLengthValid(): boolean {
    return (
      this.length1 === this.length2 && this.length1 === this.calculateLength()
    );
  }

  public isChecksumValid(): boolean {
    return this.checksum === this.calculateChecksum();
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

    return checksum;
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

  public pack(): ArrayBuffer | null {
    this.length1 = this.length2 = this.calculateLength();

    if (
      ![
        FrameType.ACK,
        FrameType.SHORT,
        FrameType.CONTROL,
        FrameType.LONG,
      ].includes(this.type)
    ) {
      return null;
    }

    this.checksum = this.calculateChecksum();

    const buffer = new ArrayBuffer(this.data.length);
    const bufView = new Uint8Array(buffer);

    switch (this.type) {
      case FrameType.ACK:
        bufView[0] = this.start1;
        buffer.resize(1);

        break;
      case FrameType.SHORT:
        bufView[0] = this.start1;
        bufView[1] = this.control;
        bufView[2] = this.address;
        bufView[3] = this.checksum;
        bufView[4] = this.stop;
        buffer.resize(5);

        break;
      case FrameType.CONTROL:
        bufView[0] = this.start1;
        bufView[1] = this.length1;
        bufView[2] = this.length2;
        bufView[3] = this.start2;
        bufView[4] = this.control;
        bufView[5] = this.address;
        bufView[6] = this.controlInformation;

        bufView[7] = this.checksum;
        bufView[8] = this.stop;

        buffer.resize(8);

        break;
      case FrameType.LONG:
        let offset = 0;

        bufView[offset++] = this.start1;
        bufView[offset++] = this.length1;
        bufView[offset++] = this.length2;
        bufView[offset++] = this.start2;
        bufView[offset++] = this.control;
        bufView[offset++] = this.address;
        bufView[offset++] = this.controlInformation;

        for (let i = 0; i < this.dataLen; i++) {
          bufView[offset++] = this.data[i];
        }

        bufView[offset++] = this.checksum;
        bufView[offset++] = this.stop;

        buffer.resize(offset);

        break;
      default:
        return null;
    }

    return buffer;
  }
}
