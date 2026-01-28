import { MbusFrame } from '@src/mbus-protocol';
import { SerialPort } from 'serialport';

export enum ReceiveResultCode {
  OK,
  ERROR,
  INVALID,
  TIMEOUT,
  RESET,
}

export enum PurgeStrategy {
  NONE,
  FIRST_M2S,
  FIRST_S2M,
}

export type MbusSerialOptions = {
  device: string;
  baudrate: 300 | 600 | 1200 | 2400 | 4800 | 9600;
};

export class MbusSerial {
  public purge: PurgeStrategy = PurgeStrategy.NONE;

  private opts: MbusSerialOptions;
  private sp: SerialPort;
  private isOpen = false;
  private isReading = false;
  private readTimer: ReturnType<typeof setTimeout> | undefined;
  private readPromise: any;
  private timeoutMs: number = 200;

  constructor(options: MbusSerialOptions) {
    this.opts = options;

    switch (this.opts.baudrate) {
      case 300:
        this.timeoutMs = 1300;
        break;
      case 600:
        this.timeoutMs = 800;
        break;
      case 1200:
        this.timeoutMs = 500;
        break;
      case 2400:
      case 4800:
        this.timeoutMs = 300;
        break;
      default:
        this.timeoutMs = 200;
        break;
    }

    this.sp = new SerialPort({
      path: this.opts.device,
      baudRate: this.opts.baudrate,
      parity: 'even',
      autoOpen: false,
    });
  }

  async open(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sp.open((err) => {
        if (err) {
          this.isOpen = false;
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async close(): Promise<void> {
    if (this.isOpen) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.sp.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async sendFrame(frame: MbusFrame): Promise<boolean> {
    if (!this.sp.isOpen) {
      console.error('Serial port is not open');

      return false;
    }

    const buf = frame.pack();

    if (!buf) {
      console.error('Failed to pack frame');
      return false;
    }

    this.sp.write(buf);

    return new Promise((resolve, reject) => {
      this.sp.drain((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  private async receive(): Promise<Buffer | null> {
    if (this.isReading) {
      return null;
    }

    this.isReading = true;

    return new Promise((resolve) => {
      this.readPromise = resolve;

      this.readTimer = setTimeout(this.readTimeout.bind(this), this.timeoutMs);
      this.sp.on('data', this.readData.bind(this));
    });
  }

  private readTimeout() {
    this.sp.removeAllListeners('data');
    this.isReading = false;

    if (this.readPromise) {
      this.readPromise(null);
      this.readPromise = undefined;
    }
  }

  private readData(data: Buffer) {
    if (this.readTimer) {
      clearTimeout(this.readTimer);
    }

    this.sp.removeAllListeners('data');
    this.isReading = false;

    if (this.readPromise) {
      this.readPromise(data);
      this.readPromise = undefined;
    }
  }

  async receiveFrame(): Promise<[ReceiveResultCode, MbusFrame | undefined]> {
    if (!this.sp.isOpen) {
      console.error('Serial port is not open');

      return [ReceiveResultCode.ERROR, undefined];
    }

    const frame = new MbusFrame();
    const buf = Buffer.alloc(2048);
    let bytesRemaining = 1;
    let bytesRead = 0;
    let nbrOfTimeouts = 0;

    do {
      if (bytesRead + bytesRemaining > buf.length) {
        // too many bytes
        return [ReceiveResultCode.ERROR, undefined];
      }

      const data = await this.receive(); // TODO receive only number bytes

      if (data === null) {
        nbrOfTimeouts++;

        if (nbrOfTimeouts >= 3) {
          break;
        }
      } else {
        if (data.length + bytesRead > buf.length) {
          // Buffer overflow, too many bytes read
          return [ReceiveResultCode.ERROR, undefined];
        }

        bytesRead += data.copy(buf, bytesRead);
      }
      bytesRemaining = frame.importData(buf, bytesRead);
    } while (bytesRemaining > 0);

    if (bytesRead === 0) {
      // Got timeout, nothing read
      return [ReceiveResultCode.TIMEOUT, undefined];
    }

    if (bytesRemaining !== 0) {
      // Would be OK when e.g. scanning the bus, otherwise it is a failure
      return [ReceiveResultCode.INVALID, undefined];
    }

    return [ReceiveResultCode.OK, frame];
  }
}
