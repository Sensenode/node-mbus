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

import { MbusProtocol, MbusSerial } from '../index';

const serial = new MbusSerial({ device: '/dev/ttyUSB0', baudrate: 2400 });
const proto = new MbusProtocol(serial);

const MBUS_ADDRESS_NETWORK_LAYER = 0xfd;

const ADDR = 11;

const run = async () => {
  await serial.open();

  await proto.sendPingFrame(MBUS_ADDRESS_NETWORK_LAYER, true);

  await proto.sendPingFrame(MBUS_ADDRESS_NETWORK_LAYER, true);

  await proto.sendRequestFrame(ADDR);

  const [result, frame] = await proto.receiveFrame();

  console.log(`Read status: ${result}, frame: ${frame && frame.data.toString('hex')}`);
  const mbusFrameData = frame?.verifyAndParse();

  if (mbusFrameData) {
    console.log(proto.mbusFrameDataToObject(mbusFrameData));
  }

  process.exit(0);
};

run();
