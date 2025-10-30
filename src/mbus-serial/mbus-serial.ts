import { SerialPort } from 'serialport';

export type MbusSerialOptions = {
  device: string;
  baudrate: 300 | 600 | 1200 | 2400 | 4800 | 9600;
};

export class MbusSerial {
  private opts: MbusSerialOptions;
  private sp: SerialPort;

  public constructor(options: MbusSerialOptions) {
    this.opts = options;

    let vtime = 2;

    switch (this.opts.baudrate) {
      case 300:
        vtime = 13;
        break;
      case 600:
        vtime = 8;
        break;
      case 1200:
        vtime = 5;
        break;
      case 2400:
      case 4800:
        vtime = 3;
        break;
      default:
        vtime = 2;
        break;
    }

    this.sp = new SerialPort({
      path: this.opts.device,
      baudRate: this.opts.baudrate,
      vmin: 0,
      vtime: vtime;
    });
  }

  public async open() {
    this.sp.open();
  }

  public async close() {
    if (this.sp.isOpen) {
      this.sp.close();
    }
  }

  public sendFrame(frame): boolean {
    if (!this.sp.isOpen) {
      return false;
    }

    const buf;

    this.sp.write(buf);

    this.sp.drain();

    return true;
  }

  public receiveFrame() {}

  // public initSlaves() {}

  // public isSecondaryAddress() {} // separate to utility class

  // public selectSecondaryAddress() {} // handle collission, nothing, error

  // public sendRequest() {}

  // public frameParse() {} // in separate parser class
}
