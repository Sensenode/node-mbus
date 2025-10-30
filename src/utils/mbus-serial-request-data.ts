import 'module-alias/register';
import { MbusProtocol } from '@src/mbus-protocol';
import { MbusSerial } from '@src/mbus-serial';

const serial = new MbusSerial({ device: '/dev/ttyUSB0', baudrate: 2400 });
const proto = new MbusProtocol(serial);

const MBUS_ADDRESS_NETWORK_LAYER = 11;
// const MBUS_ADDRESS_NETWORK_LAYER = 0xfd;

const ADDR = 11;

const run = async () => {
  await serial.open();

  console.log('Send ping frame 1');
  await proto.sendPingFrame(MBUS_ADDRESS_NETWORK_LAYER, true);

  console.log('Send ping frame 1');
  await proto.sendPingFrame(MBUS_ADDRESS_NETWORK_LAYER, true);

  await proto.sendRequestFrame(ADDR);

  const [result, frame] = await proto.receiveFrame();

  console.log(`Read status: ${result}, frame: ${frame && frame.data.toString('hex')}`);
  const mbusFrameData = frame?.verifyAndParse();
  console.log(JSON.stringify(mbusFrameData, null, 2));

  if (mbusFrameData) {
    console.log(proto.mbusFrameDataToObject(mbusFrameData));
  }

  process.exit(0);
};

run();
