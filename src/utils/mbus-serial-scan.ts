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

import { FrameType, MbusProtocol, MbusSerial, ReceiveResultCode } from '../index';

const serial = new MbusSerial({ device: '/dev/ttyUSB0', baudrate: 2400 });
const proto = new MbusProtocol(serial);

const MBUS_MAX_PRIMARY_SLAVES = 250;

const run = async () => {
  await serial.open();

  for (let i = 0; i < MBUS_MAX_PRIMARY_SLAVES; i++) {
    proto.sendPingFrame(i, false);

    const [result, frame] = await proto.receiveFrame();

    if (result === ReceiveResultCode.INVALID) {
      console.log(`Collision at address ${i}`);
    } else if (result === ReceiveResultCode.OK) {
      if (frame?.type === FrameType.ACK) {
        if (await proto.discardFrames()) {
          console.log(`Collision at address ${i}`);
        }

        console.log(`Found M-Bus device at address ${i}`);
      }
    }
  }

  process.exit(0);
};

run();
