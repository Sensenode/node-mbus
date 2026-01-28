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

import 'module-alias/register';
import { MbusProtocol } from '@src/mbus-protocol';
import { MbusSerial } from '@src/mbus-serial';

const serial = new MbusSerial({ device: '/dev/ttyUSB0', baudrate: 2400 });
const proto = new MbusProtocol(serial);

// const MBUS_ADDRESS_NETWORK_LAYER = 11;
const MBUS_ADDRESS_NETWORK_LAYER = 0xfd;

const ADDR = 11;

const run = async () => {
  await serial.open();

  console.log('Send ping frame 1');
  await proto.sendPingFrame(MBUS_ADDRESS_NETWORK_LAYER, true);

  console.log('Send ping frame 1');
  await proto.sendPingFrame(MBUS_ADDRESS_NETWORK_LAYER, true);

  const [result, frames] = await proto.sendReqestAndReceiveMultiple(ADDR, 16);

  console.log(`Got result ${result} and ${frames?.length} frames`);

  frames?.forEach((frame) => {
    const mbusFrameData = frame?.verifyAndParse();

    if (mbusFrameData) {
      console.log(proto.mbusFrameDataToObject(mbusFrameData));
    }
  });

  process.exit(0);
};

run();
