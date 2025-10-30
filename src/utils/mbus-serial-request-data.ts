import { MbusProtocol } from "@src/mbus-protocol";
import { MbusSerial } from "@src/mbus-serial";

const serial = new MbusSerial({ device: "/dev/ttyUSB0", baudrate: 2400 });
const proto = new MbusProtocol(serial);

const ADDR = 1;

proto.sendPingFrame(ADDR, true);

proto.sendRequestFrame(ADDR);
