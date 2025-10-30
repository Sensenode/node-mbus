import { MbusSerial } from '@src/mbus-serial/';
import { MbusFrame } from '@src/mbus-protocol';

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

export class MbusProtocol {
  // private serial: MbusSerial;

  public sendRequestFrame(address: number): boolean {
    if (!this.isPrimaryAddress(address)) {
      return false;
    }

    const frame = new MbusFrame(FrameType.SHORT);

    frame.control = 1;
    frame.address = address;

    return this.serial.sendFrame(frame);
  }

  public isPrimaryAddress(address: number): boolean {
    return address >= 0x0 && address <= 0xff;
  }
}
