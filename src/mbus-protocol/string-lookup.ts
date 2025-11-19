import {
  MbusDataInformationBlock,
  MbusDataRecord,
  MbusDataRecordDifeMask,
  MbusDataRecordDifMask,
  MbusDibVif,
  MbusValueInformationBlock,
} from './mbus-frame';

enum MbusVariableDataMedium {
  OTHER = 0x00,
  OIL = 0x01,
  ELECTRICITY = 0x02,
  GAS = 0x03,
  HEAT_OUT = 0x04,
  STEAM = 0x05,
  HOT_WATER = 0x06,
  WATER = 0x07,
  HEAT_COST = 0x08,
  COMPR_AIR = 0x09,
  COOL_OUT = 0x0a,
  COOL_IN = 0x0b,
  HEAT_IN = 0x0c,
  HEAT_COOL = 0x0d,
  BUS = 0x0e,
  UNKNOWN = 0x0f,
  IRRIGATION = 0x10,
  WATER_LOGGER = 0x11,
  GAS_LOGGER = 0x12,
  GAS_CONV = 0x13,
  CALORIFIC = 0x14,
  BOIL_WATER = 0x15,
  COLD_WATER = 0x16,
  DUAL_WATER = 0x17,
  PRESSURE = 0x18,
  ADC = 0x19,
  SMOKE = 0x1a,
  ROOM_SENSOR = 0x1b,
  GAS_DETECTOR = 0x1c,
  BREAKER_E = 0x20,
  VALVE = 0x21,
  CUSTOMER_UNIT = 0x25,
  WASTE_WATER = 0x28,
  GARBAGE = 0x29,
  SERVICE_UNIT = 0x30,
  RC_SYSTEM = 0x36,
  RC_METER = 0x37,
}

export function variableMediumToString(medium: number) {
  switch (medium) {
    case MbusVariableDataMedium.OTHER:
      return 'Other';
    case MbusVariableDataMedium.OIL:
      return 'Oil';
    case MbusVariableDataMedium.ELECTRICITY:
      return 'Electricity';
    case MbusVariableDataMedium.GAS:
      return 'Gas';
    case MbusVariableDataMedium.HEAT_OUT:
      return 'Heat: Outlet';
    case MbusVariableDataMedium.STEAM:
      return 'Steam';
    case MbusVariableDataMedium.HOT_WATER:
      return 'Warm water (30-90°C)';
    case MbusVariableDataMedium.WATER:
      return 'Water';
    case MbusVariableDataMedium.HEAT_COST:
      return 'Heat Cost Allocator';
    case MbusVariableDataMedium.COMPR_AIR:
      return 'Compressed Air';
    case MbusVariableDataMedium.COOL_OUT:
      return 'Cooling load meter: Outlet';
    case MbusVariableDataMedium.COOL_IN:
      return 'Cooling load meter: Inlet';
    case MbusVariableDataMedium.HEAT_IN:
      return 'Heat: Inlet';
    case MbusVariableDataMedium.HEAT_COOL:
      return 'Heat / Cooling load meter';
    case MbusVariableDataMedium.BUS:
      return 'Bus/System';
    case MbusVariableDataMedium.UNKNOWN:
      return 'Unknown Medium';
    case MbusVariableDataMedium.IRRIGATION:
      return 'Irrigation Water';
    case MbusVariableDataMedium.WATER_LOGGER:
      return 'Water Logger';
    case MbusVariableDataMedium.GAS_LOGGER:
      return 'Gas Logger';
    case MbusVariableDataMedium.GAS_CONV:
      return 'Gas Converter';
    case MbusVariableDataMedium.CALORIFIC:
      return 'Calorific value';
    case MbusVariableDataMedium.BOIL_WATER:
      return 'Hot water (>90°C)';
    case MbusVariableDataMedium.COLD_WATER:
      return 'Cold water';
    case MbusVariableDataMedium.DUAL_WATER:
      return 'Dual water';
    case MbusVariableDataMedium.PRESSURE:
      return 'Pressure';
    case MbusVariableDataMedium.ADC:
      return 'A/D Converter';
    case MbusVariableDataMedium.SMOKE:
      return 'Smoke Detector';
    case MbusVariableDataMedium.ROOM_SENSOR:
      return 'Ambient Sensor';
    case MbusVariableDataMedium.GAS_DETECTOR:
      return 'Gas Detector';
    case MbusVariableDataMedium.BREAKER_E:
      return 'Breaker: Electricity';
    case MbusVariableDataMedium.VALVE:
      return 'Valve: Gas or Water';
    case MbusVariableDataMedium.CUSTOMER_UNIT:
      return 'Customer Unit: Display Device';
    case MbusVariableDataMedium.WASTE_WATER:
      return 'Waste Water';
    case MbusVariableDataMedium.GARBAGE:
      return 'Garbage';
    case MbusVariableDataMedium.SERVICE_UNIT:
      return 'Service Unit';
    case MbusVariableDataMedium.RC_SYSTEM:
      return 'Radio Converter: System';
    case MbusVariableDataMedium.RC_METER:
      return 'Radio Converter: Meter';
    case 0x22:
    case 0x23:
    case 0x24:
    case 0x26:
    case 0x27:
    case 0x2a:
    case 0x2b:
    case 0x2c:
    case 0x2d:
    case 0x2e:
    case 0x2f:
    case 0x31:
    case 0x32:
    case 0x33:
    case 0x34:
    case 0x38:
    case 0x39:
    case 0x3a:
    case 0x3b:
    case 0x3c:
    case 0x3d:
    case 0x3e:
    case 0x3f:
      return 'Reserved';
    default:
      return `Unknown medium 0x${medium.toString(16)}`;
  }
}

export function manufacturerToString(manufacturer: number[]): string {
  const integer = bytesToNumber(manufacturer);

  return (
    String.fromCharCode(((integer >> 10) & 0x001f) + 64) +
    String.fromCharCode(((integer >> 5) & 0x001f) + 64) +
    String.fromCharCode((integer & 0x001f) + 64)
  );
}

function bytesToNumber(bytes: number[] | Buffer, nbrBytes?: number): number {
  const length = nbrBytes === undefined ? bytes.length : nbrBytes;

  let tmp: Buffer;
  if (Buffer.isBuffer(bytes)) {
    tmp = bytes;
  } else {
    tmp = Buffer.from(bytes);
  }

  switch (length) {
    case 1:
      return tmp.readUInt8(0);
    case 2:
      return tmp.readUInt16LE(0);
    case 3:
      return tmp.readUIntLE(0, 3);
    case 4:
      return tmp.readUInt32LE(0);
    case 6:
      return tmp.readUIntLE(0, 6);
    case 8:
      return tmp.readBigUInt64LE(0) as unknown as number;
    default:
      console.error(`Unsupported integer length ${length}`);
      return -1;
  }
}

export function bcdDecode(bcd: number[] | Buffer): number {
  let value = 0;

  for (let i = bcd.length; i > 0; i--) {
    value = value * 100 + ((bcd[i - 1] >> 4) & 0x0f) * 10 + (bcd[i - 1] & 0x0f);
  }

  return value;
}

function bcdDecodeHex(bcd: number[] | Buffer): number {
  let value = 0;

  for (let i = bcd.length; i > 0; i--) {
    value = (value << 8) | bcd[i - 1];
  }

  return value;
}

export function recordFunctionToString(dif: MbusDataInformationBlock): string {
  switch (dif.dif & MbusDataRecordDifMask.FUNCTION) {
    case 0x00:
      return 'Instantaneous value';
    case 0x10:
      return 'Maximum value';
    case 0x20:
      return 'Minimum value';
    case 0x30:
      return 'Value during error state';
    default:
      return 'unknown';
  }
}

export function recordStorageNumber(record: MbusDataRecord): number {
  let result = (record.header.dib.dif & MbusDataRecordDifMask.STORAGE_NO) >> 6;
  let bit_index = 1;

  record.header.dib.dife.forEach((dife) => {
    result |= (dife & MbusDataRecordDifMask.STORAGE_NO) << bit_index;
    bit_index += 4;
  });

  return result;
}

export function recordTariff(record: MbusDataRecord): number {
  let result = 0;

  if (record.header.dib.dife.length === 0) {
    return -1;
  }

  record.header.dib.dife.forEach((dife, index) => {
    result |= ((dife & MbusDataRecordDifeMask.TARIFF) >> 6) << index;
  });

  return result;
}

export function recordDevice(record: MbusDataRecord): number {
  let result = 0;

  if (record.header.dib.dife.length === 0) {
    return -1;
  }

  record.header.dib.dife.forEach((dife, index) => {
    result |= ((dife & MbusDataRecordDifeMask.DEVICE) >> 6) << index;
  });

  return result;
}

export function recordValueNumber(record: MbusDataRecord): number | Date | string | null {
  // ignore extension bit
  const vif = record.header.vib.vif & MbusDibVif.WITHOUT_EXTENSION;
  const vife = record.header.vib.vife?.length > 0 ? record.header.vib.vife[0] & MbusDibVif.WITHOUT_EXTENSION : 0;

  switch (record.header.dib.dif & MbusDataRecordDifMask.DATA) {
    case 0x00: // no data
      return null;
    case 0x01: // 1 byte integer (8 bit)
      return dataIntegerDecode(record.data, 1);
    case 0x02: // 2 byte (16 bit)
      // E110 1100  Time Point (date)
      if (vif === 0x6c) {
        return dataTimestampDecode(record.data);
      } else {
        // 2 byte integer
        return dataIntegerDecode(record.data, 2);
      }
    case 0x03: // 3 byte integer (24 bit)
      return dataIntegerDecode(record.data, 3);
    case 0x04: // 4 byte (32 bit)
      // E110 1101  Time Point (date/time)
      // E011 0000  Start (date/time) of tariff
      // E111 0000  Date and time of battery change
      if (
        vif === 0x6d ||
        (record.header.vib.vif === 0xfd && vife === 0x30) ||
        (record.header.vib.vif === 0xfd && vife === 0x70)
      ) {
        return dataTimestampDecode(record.data);
      } else {
        // 4 byte integer
        return dataIntegerDecode(record.data, 4);
      }
    case 0x05: // 4 Byte Real (32 bit)
      return dataFloatDecode(record.data);
    case 0x06: // 6 byte (48 bit)
      // E110 1101  Time Point (date/time)
      // E011 0000  Start (date/time) of tariff
      // E111 0000  Date and time of battery change
      if (
        vif === 0x6d ||
        (record.header.vib.vif === 0xfd && vife === 0x30) ||
        (record.header.vib.vif === 0xfd && vife === 0x70)
      ) {
        return dataTimestampDecode(record.data);
      } else {
        // 6 byte integer
        return dataIntegerDecode(record.data, 6);
      }
    case 0x07: // 8 byte integer (64 bit)
      return dataIntegerDecode(record.data, 8);
    case 0x09: // 2 digit BCD (8 bit)
    case 0x0a: // 4 digit BCD (16 bit)
    case 0x0b: // 6 digit BCD (24 bit)
    case 0x0c: // 8 digit BCD (32 bit)
    case 0x0e: // 12 digit BCD (48 bit)
      if ((record.header.dib.dif & MbusDataRecordDifMask.FUNCTION) === 0x30) {
        return bcdDecodeHex(record.data);
      } else {
        return bcdDecode(record.data);
      }
    case 0x0f: // special functions // TODO
      return record.data.toString('hex');
    case 0x0d: // variable length
      if (record.data[0] <= 0xbf) {
        return String.fromCharCode(...record.data.subarray(1));
      } else {
        return record.data.subarray(1).toString('hex');
      }
    default:
      console.error(`Unknown DIF (0x${toHex(record.header.dib.dif)})`);
      return null;
  }
}

function dataIntegerDecode(data: Buffer, length: number): number {
  return bytesToNumber(data, length);
}

function dataFloatDecode(data: Buffer): number {
  return data.readFloatLE(0);
}

function dataTimestampDecode(data: Buffer): Date | null {
  if (data.length === 6) {
    // Type I = Compound CP48: Date and Time
    if ((data[1] & 0x80) === 0) {
      // Time valid ?
      const second = data[0] & 0x3f;
      const minute = data[1] & 0x3f;
      const hour = data[2] & 0x1f;
      const day = data[3] & 0x1f;
      const month = (data[4] & 0x0f) - 1;
      const year = 100 + (((data[3] & 0xe0) >> 5) | ((data[4] & 0xf0) >> 1));
      // TODO Handle DST
      // const dst = (data[0] & 0x40) ? 1 : 0;  // day saving time

      return new Date(year, month, day, hour, minute, second);
    }
  } else if (data.length === 4) {
    // Type F = Compound CP32: Date and Time
    if ((data[0] & 0x80) === 0) {
      // Time valid ?
      const minute = data[0] & 0x3f;
      const hour = data[1] & 0x1f;
      const day = data[2] & 0x1f;
      const month = (data[3] & 0x0f) - 1;
      const year = ((data[2] & 0xe0) >> 5) | ((data[3] & 0xf0) >> 1);
      let hundredYear = (data[1] & 0x60) >> 5;
      if (hundredYear === 0 && year <= 80) {
        //  compatibility with old meters with a circular two digit date
        hundredYear = 1;
      }
      // TODO Handle DST
      // const dst = data[1] & 0x80;  // day saving time
      return new Date(
        hundredYear === 0 && year <= 80 ? 100 + year : hundredYear * 100 + year,
        month,
        day,
        hour,
        minute,
      );
    }
  } else if (data.length === 2) {
    // Type G: Compound CP16: Date
    const day = data[0] & 0x1f;
    const month = (data[1] & 0x0f) - 1;
    const year = 100 + (((data[0] & 0xe0) >> 5) | ((data[1] & 0xf0) >> 1));

    return new Date(year, month, day);
  }

  return null;
}

export function recordUnitToFactorAndQuantity(
  vib: MbusValueInformationBlock,
): [number, string] | [undefined, undefined] {
  if (vib.vif === 0xfb) {
    if (vib.vife.length === 0) {
      return [undefined, undefined];
    }

    const vife0 = vib.vife[0] & 0xff;

    switch (vife0 & MbusDibVif.WITHOUT_EXTENSION) {
      case 0x00:
      case 0x01:
        return [(vife0 & 0x01) === 0 ? 0.01 : 0.001, 'kWh'];
      case 0x02:
      case 0x03:
      case 0x04:
      case 0x05:
      case 0x06:
      case 0x07:
        return [undefined, undefined];
      case 0x08:
      case 0x09:
        return [(vife0 & 0x01) === 0 ? 0.00001 : 0.000001, 'kWh'];
      case 0x0a:
      case 0x0b:
      case 0x0c:
      case 0x0d:
      case 0x0e:
      case 0x0f:
        return [undefined, undefined];
      case 0x10:
      case 0x11:
        return [unitFactor((vife0 & 0x01) + 2), 'm³'];
      case 0x12:
      case 0x13:
      case 0x14:
      case 0x15:
      case 0x16:
      case 0x17:
        return [undefined, undefined];
      case 0x18:
      case 0x19:
        return [unitFactor((vife0 & 0x01) + 2) * 0.000001, 'g'];
      case 0x1a:
      case 0x1b:
      case 0x1c:
      case 0x1d:
      case 0x1e:
      case 0x1f:
      case 0x20:
        return [undefined, undefined];
      case 0x21:
        return [0.0028316846592, 'm³'];
      case 0x22:
      case 0x23:
        return [(vife0 & 0x01) === 0 ? 0.0003785411784 : 0.003785411784, 'm³'];
      case 0x24:
        return [0.0630901964, 'm³'];
      case 0x25:
        return [0.0000630901964, 'm³'];
      case 0x26:
        return [0.0000010515032733333, 'm³'];
      case 0x27:
        return [undefined, undefined];
      case 0x28:
      case 0x29:
        return [(vife0 & 0x01) === 0 ? 100000 : 1000000, 'W'];
      case 0x2a:
      case 0x2b:
      case 0x2c:
      case 0x2d:
      case 0x2e:
      case 0x2f:
        return [undefined, undefined];
      case 0x30:
      case 0x31:
        return [(vife0 & 0x01) === 0 ? 1e8 / 3600 : 1e9 / 3600, 'W'];
      case 0x32:
      case 0x33:
      case 0x34:
      case 0x35:
      case 0x36:
      case 0x37:
      case 0x38:
      case 0x39:
      case 0x3a:
      case 0x3b:
      case 0x3c:
      case 0x3d:
      case 0x3e:
      case 0x3f:
      case 0x40:
      case 0x41:
      case 0x42:
      case 0x43:
      case 0x44:
      case 0x45:
      case 0x46:
      case 0x47:
      case 0x48:
      case 0x49:
      case 0x4a:
      case 0x4b:
      case 0x4c:
      case 0x4d:
      case 0x4e:
      case 0x4f:
      case 0x52:
      case 0x53:
      case 0x54:
      case 0x55:
      case 0x56:
      case 0x57:
        return [undefined, undefined];
      case 0x58:
      case 0x59:
      case 0x5a:
      case 0x5b:
        return [unitFactor((vife0 & 0x03) - 3), '°F'];
      case 0x5c:
      case 0x5d:
      case 0x5e:
      case 0x5f:
        return [unitFactor((vife0 & 0x03) - 3), '°F'];
      case 0x60:
      case 0x61:
      case 0x62:
      case 0x63:
        return [unitFactor((vife0 & 0x03) - 3), '°F'];
      case 0x64:
      case 0x65:
      case 0x66:
      case 0x67:
        return [unitFactor((vife0 & 0x03) - 3), '°F'];
      case 0x68:
      case 0x69:
      case 0x6a:
      case 0x6b:
      case 0x6c:
      case 0x6d:
      case 0x6e:
      case 0x6f:
        return [undefined, undefined];
      case 0x70:
      case 0x71:
      case 0x72:
      case 0x73:
        return [unitFactor((vife0 & 0x03) - 3), '°F'];
      case 0x74:
      case 0x75:
      case 0x76:
      case 0x77:
        return [unitFactor((vife0 & 0x03) - 3), '°C'];
      case 0x78:
      case 0x79:
      case 0x7a:
      case 0x7b:
      case 0x7c:
      case 0x7d:
      case 0x7e:
      case 0x7f:
        return [unitFactor((vife0 & 0x07) - 3), 'W'];
      default:
        return [undefined, undefined];
    }
  } else if (vib.vif === 0xfd) {
    const vife0 = vib.vife[0] & MbusDibVif.WITHOUT_EXTENSION;

    if ((vife0 & 0x70) === 0x40) {
      return [unitFactor((vife0 & 0x0f) - 9), 'V'];
    } else if ((vife0 & 0x70) === 0x50) {
      return [unitFactor((vife0 & 0x0f) - 12), 'A'];
    }

    return [undefined, undefined];
  } else if (vib.vif === 0x7c) {
    return [undefined, undefined];
  } else if (vib.vif === 0xfc && (vib.vife[0] & 0x78) === 0x70) {
    return [undefined, undefined];
  }

  switch (vib.vif & MbusDibVif.WITHOUT_EXTENSION) {
    case 0x00:
    case 0x00 + 1:
    case 0x00 + 2:
    case 0x00 + 3:
    case 0x00 + 4:
    case 0x00 + 5:
    case 0x00 + 6:
    case 0x00 + 7:
      return [unitFactor((vib.vif & 0x07) - 3) / 1000, 'kWh'];
    case 0x08:
    case 0x08 + 1:
    case 0x08 + 2:
    case 0x08 + 3:
    case 0x08 + 4:
    case 0x08 + 5:
    case 0x08 + 6:
    case 0x08 + 7:
      return [unitFactor(vib.vif & 0x07) * 2.7777777777778e-7, 'kWh'];
    case 0x18:
    case 0x18 + 1:
    case 0x18 + 2:
    case 0x18 + 3:
    case 0x18 + 4:
    case 0x18 + 5:
    case 0x18 + 6:
    case 0x18 + 7:
      return [unitFactor((vib.vif & 0x07) - 3) * 1000, 'g'];
    case 0x28:
    case 0x28 + 1:
    case 0x28 + 2:
    case 0x28 + 3:
    case 0x28 + 4:
    case 0x28 + 5:
    case 0x28 + 6:
    case 0x28 + 7:
      return [unitFactor((vib.vif & 0x07) - 3), 'W'];
    case 0x30:
    case 0x30 + 1:
    case 0x30 + 2:
    case 0x30 + 3:
    case 0x30 + 4:
    case 0x30 + 5:
    case 0x30 + 6:
    case 0x30 + 7:
      return [unitFactor(vib.vif & 0x07) * 0.00027777777777778, 'W'];
    case 0x10:
    case 0x10 + 1:
    case 0x10 + 2:
    case 0x10 + 3:
    case 0x10 + 4:
    case 0x10 + 5:
    case 0x10 + 6:
    case 0x10 + 7:
      return [unitFactor((vib.vif & 0x07) - 6), 'm³'];
    case 0x38:
    case 0x38 + 1:
    case 0x38 + 2:
    case 0x38 + 3:
    case 0x38 + 4:
    case 0x38 + 5:
    case 0x38 + 6:
    case 0x38 + 7:
      return [unitFactor((vib.vif & 0x07) - 6) / 3600, 'm³/s'];
    case 0x40:
    case 0x40 + 1:
    case 0x40 + 2:
    case 0x40 + 3:
    case 0x40 + 4:
    case 0x40 + 5:
    case 0x40 + 6:
    case 0x40 + 7:
      return [unitFactor((vib.vif & 0x07) - 7) / 60, 'm³/s'];
    case 0x48:
    case 0x48 + 1:
    case 0x48 + 2:
    case 0x48 + 3:
    case 0x48 + 4:
    case 0x48 + 5:
    case 0x48 + 6:
    case 0x48 + 7:
      return [unitFactor((vib.vif & 0x07) - 9), 'm³/s'];
    case 0x50:
    case 0x50 + 1:
    case 0x50 + 2:
    case 0x50 + 3:
    case 0x50 + 4:
    case 0x50 + 5:
    case 0x50 + 6:
    case 0x50 + 7:
      return [undefined, undefined]; // TODO support flow-mass
    case 0x58:
    case 0x58 + 1:
    case 0x58 + 2:
    case 0x58 + 3:
      return [unitFactor((vib.vif & 0x03) - 3), '°C'];
    case 0x5c:
    case 0x5c + 1:
    case 0x5c + 2:
    case 0x5c + 3:
      return [unitFactor((vib.vif & 0x03) - 3), '°C'];
    case 0x68:
    case 0x68 + 1:
    case 0x68 + 2:
    case 0x68 + 3:
      return [undefined, undefined];
    case 0x20:
    case 0x20 + 1:
    case 0x20 + 2:
    case 0x20 + 3:
    case 0x24:
    case 0x24 + 1:
    case 0x24 + 2:
    case 0x24 + 3:
    case 0x70:
    case 0x70 + 1:
    case 0x70 + 2:
    case 0x70 + 3:
    case 0x74:
    case 0x74 + 1:
    case 0x74 + 2:
    case 0x74 + 3:
    case 0x6c:
    case 0x6c + 1:
      return [undefined, undefined];
    case 0x60:
    case 0x60 + 1:
    case 0x60 + 2:
    case 0x60 + 3:
      return [unitFactor((vib.vif & 0x03) - 3), '°C'];
    case 0x64:
    case 0x64 + 1:
    case 0x64 + 2:
    case 0x64 + 3:
      return [unitFactor((vib.vif & 0x03) - 3), '°C'];
    case 0x6e:
    case 0x6f:
    case 0x7c:
    case 0x78:
    case 0x7a:
    case 0x7f:
    case 0xff:
      return [undefined, undefined];
    default:
      return [undefined, undefined];
  }
}

export function recordUnitString(vib: MbusValueInformationBlock): string {
  if (vib.vif === 0xfb) {
    // first type of VIF extention: see table 8.4.4
    if (vib.vife.length === 0) {
      return 'Missing VIF extension';
    }

    return vibUnitLookupFb(vib);
  } else if (vib.vif === 0xfd) {
    // first type of VIF extention: see table 8.4.4
    if (vib.vife.length === 0) {
      return 'Missing VIF extension';
    }

    return vibUnitLookupFd(vib);
  } else if (vib.vif === 0x7c) {
    // custom VIF
    return String.fromCharCode(...vib.customVif);
  } else if (vib.vif === 0xfc && (vib.vife[0] & 0x78) === 0x70) {
    // custom VIF
    return `${unitPrefix((vib.vife[0] & 0x07) - 6)} ${String.fromCharCode(...vib.customVif)}`;
  }

  return vifUnitLookup(vib.vif); // no extention, use VIF
}

function unitPrefix(exp: number): string {
  // TODO Fix this crap, need to rescale too, not add useless scaling prefixes
  const table: Record<number, string> = {
    [-6]: 'µ',
    [-5]: '100 m',
    [-4]: '10 m',
    [-3]: 'm',
    [-2]: 'c',
    [-1]: 'd',
    [0]: '',
    [1]: '10*',
    [2]: '100*',
    [3]: 'k',
    [4]: '10 k',
    [5]: '100 k',
    [6]: 'M',
    [7]: '10 M',
    [8]: '100 M',
    [9]: 'G',
  };
  return table[exp] ?? `1e${exp}`;
}

function unitFactor(exp: number): number {
  return 10 ** exp;
}

export function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}

function vifUnitLookup(vif: number): string {
  switch (
    vif & MbusDibVif.WITHOUT_EXTENSION // ignore the extension bit in this selection
  ) {
    // E000 0nnn Energy 10(nnn-3) W
    case 0x00:
    case 0x00 + 1:
    case 0x00 + 2:
    case 0x00 + 3:
    case 0x00 + 4:
    case 0x00 + 5:
    case 0x00 + 6:
    case 0x00 + 7:
      return `Energy (${unitPrefix((vif & 0x07) - 3)} Wh)`;
    // 0000 1nnn          Energy       10(nnn)J     (0.001kJ to 10000kJ)
    case 0x08:
    case 0x08 + 1:
    case 0x08 + 2:
    case 0x08 + 3:
    case 0x08 + 4:
    case 0x08 + 5:
    case 0x08 + 6:
    case 0x08 + 7:
      return `Energy (${unitPrefix(vif & 0x07)} J)`;
    // E001 1nnn Mass 10(nnn-3) kg 0.001kg to 10000kg
    case 0x18:
    case 0x18 + 1:
    case 0x18 + 2:
    case 0x18 + 3:
    case 0x18 + 4:
    case 0x18 + 5:
    case 0x18 + 6:
    case 0x18 + 7:
      return `Mass (${unitPrefix((vif & 0x07) - 3)} kg)`;
    // E010 1nnn Power 10(nnn-3) W 0.001W to 10000W
    case 0x28:
    case 0x28 + 1:
    case 0x28 + 2:
    case 0x28 + 3:
    case 0x28 + 4:
    case 0x28 + 5:
    case 0x28 + 6:
    case 0x28 + 7:
      return `Power (${unitPrefix((vif & 0x07) - 3)} W)`;
    // E011 0nnn Power 10(nnn) J/h 0.001kJ/h to 10000kJ/h
    case 0x30:
    case 0x30 + 1:
    case 0x30 + 2:
    case 0x30 + 3:
    case 0x30 + 4:
    case 0x30 + 5:
    case 0x30 + 6:
    case 0x30 + 7:
      return `Power (${unitPrefix(vif & 0x07)} J/h)`;
    // E001 0nnn Volume 10(nnn-6) m3 0.001l to 10000l
    case 0x10:
    case 0x10 + 1:
    case 0x10 + 2:
    case 0x10 + 3:
    case 0x10 + 4:
    case 0x10 + 5:
    case 0x10 + 6:
    case 0x10 + 7:
      return `Volume (${unitPrefix((vif & 0x07) - 6)} m³)`;
    // E011 1nnn Volume Flow 10(nnn-6) m3/h 0.001l/h to 10000l/
    case 0x38:
    case 0x38 + 1:
    case 0x38 + 2:
    case 0x38 + 3:
    case 0x38 + 4:
    case 0x38 + 5:
    case 0x38 + 6:
    case 0x38 + 7:
      return `Volume flow (${unitPrefix((vif & 0x07) - 6)} m³/h)`;
    // E100 0nnn Volume Flow ext. 10(nnn-7) m3/min 0.0001l/min to 1000l/min
    case 0x40:
    case 0x40 + 1:
    case 0x40 + 2:
    case 0x40 + 3:
    case 0x40 + 4:
    case 0x40 + 5:
    case 0x40 + 6:
    case 0x40 + 7:
      return `Volume flow (${unitPrefix((vif & 0x07) - 7)} m³/min)`;
    // E100 1nnn Volume Flow ext. 10(nnn-9) m3/s 0.001ml/s to 10000ml/
    case 0x48:
    case 0x48 + 1:
    case 0x48 + 2:
    case 0x48 + 3:
    case 0x48 + 4:
    case 0x48 + 5:
    case 0x48 + 6:
    case 0x48 + 7:
      return `Volume flow (${unitPrefix((vif & 0x07) - 9)} m³/s)`;
    // E101 0nnn Mass flow 10(nnn-3) kg/h 0.001kg/h to 10000kg/
    case 0x50:
    case 0x50 + 1:
    case 0x50 + 2:
    case 0x50 + 3:
    case 0x50 + 4:
    case 0x50 + 5:
    case 0x50 + 6:
    case 0x50 + 7:
      return `Mass flow (${unitPrefix((vif & 0x07) - 3)} kg/h)`;
    // E101 10nn Flow Temperature 10(nn-3) °C 0.001°C to 1°C
    case 0x58:
    case 0x58 + 1:
    case 0x58 + 2:
    case 0x58 + 3:
      return `Flow Temperature (${unitPrefix((vif & 0x03) - 3)} °C)`;
    // E101 11nn Return Temperature 10(nn-3) °C 0.001°C to 1°C
    case 0x5c:
    case 0x5c + 1:
    case 0x5c + 2:
    case 0x5c + 3:
      return `Return Temperature (${unitPrefix((vif & 0x03) - 3)} °C)`;
    // E110 10nn Pressure 10(nn-3) bar 1mbar to 1000mbar
    case 0x68:
    case 0x68 + 1:
    case 0x68 + 2:
    case 0x68 + 3:
      return `Pressure (${unitPrefix((vif & 0x03) - 3)} bar)`;
    // E010 00nn On Time
    // nn = 00 seconds
    // nn = 01 minutes
    // nn = 10   hours
    // nn = 11    days
    // E010 01nn Operating Time coded like OnTime
    // E111 00nn Averaging Duration coded like OnTime
    // E111 01nn Actuality Duration coded like OnTime
    case 0x20:
    case 0x20 + 1:
    case 0x20 + 2:
    case 0x20 + 3:
    case 0x24:
    case 0x24 + 1:
    case 0x24 + 2:
    case 0x24 + 3:
    case 0x70:
    case 0x70 + 1:
    case 0x70 + 2:
    case 0x70 + 3:
    case 0x74:
    case 0x74 + 1:
    case 0x74 + 2:
    case 0x74 + 3:
      const offset =
        (vif & 0x7c) === 0x20
          ? 'On time'
          : (vif & 0x7c) === 0x24
            ? 'Operating time'
            : (vif & 0x7c) === 0x70
              ? 'Averaging Duration'
              : 'Actuality Duration';

      switch (vif & 0x03) {
        case 0x00:
          return `${offset} (seconds)`;
        case 0x01:
          return `${offset} (minutes)`;
        case 0x02:
          return `${offset} (hours)`;
        case 0x03:
          return `${offset} (days)`;
      }

    // E110 110n Time Point
    // n = 0        date
    // n = 1 time & date
    // data type G
    // data type F
    case 0x6c:
    case 0x6c + 1:
      return vif & 0x01 ? 'Time Point (time & date)' : 'Time Point (date)';
    // E110 00nn    Temperature Difference   10(nn-3)K   (mK to  K)
    case 0x60:
    case 0x60 + 1:
    case 0x60 + 2:
    case 0x60 + 3:
      return `Temperature Difference (${unitPrefix((vif & 0x03) - 3)} °C)`;
    // E110 01nn External Temperature 10(nn-3) °C 0.001°C to 1°C
    case 0x64:
    case 0x64 + 1:
    case 0x64 + 2:
    case 0x64 + 3:
      return `External Temperature (${unitPrefix((vif & 0x03) - 3)} °C)`;
    // E110 1110 Units for H.C.A. dimensionless
    case 0x6e:
      return 'Units for H.C.A.';
    // E110 1111 Reserved
    case 0x6f:
      return 'Reserved';
    // Custom VIF in the following string: never reached...
    case 0x7c:
      return 'Custom VIF';
    // Fabrication No
    case 0x78:
      return 'Fabrication number';
    // Bus Address
    case 0x7a:
      return 'Bus Address';
    // Manufacturer specific: 7Fh / FF
    case 0x7f:
    case 0xff:
      return 'Manufacturer specific';
    default:
      return `Unknown (VIF=0x${toHex(vif)})`;
  }
}

export function vibUnitLookupFb(vib: MbusValueInformationBlock): string {
  const vife0 = vib.vife[0] & 0xff;

  switch (vife0 & MbusDibVif.WITHOUT_EXTENSION) {
    case 0x00:
    case 0x01:
      // E000 000n
      return `Energy (${(vife0 & 0x01) === 0 ? '0.1' : ''} MWh)`;
    case 0x02:
    case 0x03:
    // E000 001n
    case 0x04:
    case 0x05:
    case 0x06:
    case 0x07:
      // E000 01nn
      return `Reserved (0x${toHex(vife0)})`;
    case 0x08:
    case 0x09:
      // E000 100n
      return `Energy (${(vife0 & 0x01) === 0 ? '0.1' : ''} GJ)`;
    case 0x0a:
    case 0x0b:
    case 0x0c:
    case 0x0d:
    case 0x0e:
    case 0x0f:
      // E000 101n / E000 11nn
      return `Reserved (0x${toHex(vife0)})`;
    case 0x10:
    case 0x11:
      // E001 000n
      return `Volume (${unitPrefix((vife0 & 0x01) + 2)} m³)`;
    case 0x12:
    case 0x13:
    case 0x14:
    case 0x15:
    case 0x16:
    case 0x17:
      // E001 001n / E001 01nn
      return `Reserved (0x${toHex(vife0)})`;
    case 0x18:
    case 0x19:
      // E001 100n
      return `Mass (${unitPrefix((vife0 & 0x01) + 2)} t)`;
    case 0x1a:
    case 0x1b:
    case 0x1c:
    case 0x1d:
    case 0x1e:
    case 0x1f:
    case 0x20:
      // E001 1010 to E010 0000
      return `Reserved (0x${toHex(vife0)})`;
    case 0x21:
      // E010 0001
      return 'Volume (0.1 feet³)';
    case 0x22:
    case 0x23:
      // E010 001n
      return `Volume (${(vife0 & 0x01) === 0 ? '0.1' : ''} American gallon)`;
    case 0x24:
      // E010 0100
      return 'Volume flow (0.001 American gallon/min)';
    case 0x25:
      // E010 0101
      return 'Volume flow (American gallon/min)';
    case 0x26:
      // E010 0110
      return 'Volume flow (American gallon/h)';
    case 0x27:
      // E010 0111 — Reserved
      return `Reserved (0x${toHex(vife0)})`;
    case 0x28:
    case 0x29:
      // E010 100n
      return `Power (${(vife0 & 0x01) === 0 ? '0.1' : ''} MW)`;
    case 0x2a:
    case 0x2b:
    case 0x2c:
    case 0x2d:
    case 0x2e:
    case 0x2f:
      // E010 101n / E010 11nn
      return `Reserved (0x${toHex(vife0)})`;
    case 0x30:
    case 0x31:
      // E011 000n
      return `Power (${(vife0 & 0x01) === 0 ? '0.1' : ''} GJ/h)`;
    case 0x32:
    case 0x33:
    case 0x34:
    case 0x35:
    case 0x36:
    case 0x37:
    case 0x38:
    case 0x39:
    case 0x3a:
    case 0x3b:
    case 0x3c:
    case 0x3d:
    case 0x3e:
    case 0x3f:
    case 0x40:
    case 0x41:
    case 0x42:
    case 0x43:
    case 0x44:
    case 0x45:
    case 0x46:
    case 0x47:
    case 0x48:
    case 0x49:
    case 0x4a:
    case 0x4b:
    case 0x4c:
    case 0x4d:
    case 0x4e:
    case 0x4f:
    case 0x52:
    case 0x53:
    case 0x54:
    case 0x55:
    case 0x56:
    case 0x57:
      // E011 0010 to E101 0111
      return `Reserved (0x${toHex(vife0)})`;
    case 0x58:
    case 0x59:
    case 0x5a:
    case 0x5b:
      // E101 10nn
      return `Flow Temperature (${unitPrefix((vife0 & 0x03) - 3)} °F)`;
    case 0x5c:
    case 0x5d:
    case 0x5e:
    case 0x5f:
      // E101 11nn
      return `Return Temperature (${unitPrefix((vife0 & 0x03) - 3)} °F)`;
    case 0x60:
    case 0x61:
    case 0x62:
    case 0x63:
      // E110 00nn
      return `Temperature Difference (${unitPrefix((vife0 & 0x03) - 3)} °F)`;
    case 0x64:
    case 0x65:
    case 0x66:
    case 0x67:
      // E110 01nn
      return `External Temperature (${unitPrefix((vife0 & 0x03) - 3)} °F)`;
    case 0x68:
    case 0x69:
    case 0x6a:
    case 0x6b:
    case 0x6c:
    case 0x6d:
    case 0x6e:
    case 0x6f:
      // E110 1nnn
      return `Reserved (0x${toHex(vife0)})`;
    case 0x70:
    case 0x71:
    case 0x72:
    case 0x73:
      // E111 00nn
      return `Cold / Warm Temperature Limit (${unitPrefix((vife0 & 0x03) - 3)} °F)`;
    case 0x74:
    case 0x75:
    case 0x76:
    case 0x77:
      // E111 01nn
      return `Cold / Warm Temperature Limit (${unitPrefix((vife0 & 0x03) - 3)} °C)`;
    case 0x78:
    case 0x79:
    case 0x7a:
    case 0x7b:
    case 0x7c:
    case 0x7d:
    case 0x7e:
    case 0x7f:
      // E111 1nnn
      return `cumul. count max power (${unitPrefix((vife0 & 0x07) - 3)} W)`;
    default:
      return `Unrecognized VIF 0xFB extension: 0x${toHex(vife0)}`;
  }
}

function unitDurationNn(nn: number): string {
  switch (nn) {
    case 0:
      return 'second(s)';
    case 1:
      return 'minute(s)';
    case 2:
      return 'hour(s)';
    case 3:
      return 'day(s)';
  }

  return 'error: out-of-range';
}

function unitDurationPp(pp: number): string {
  switch (pp) {
    case 0:
      return 'hour(s)';
    case 1:
      return 'day(s)';
    case 2:
      return 'month(s)';
    case 3:
      return 'year(s)';
  }

  return 'error: out-of-range';
}

export function vibUnitLookupFd(vib: MbusValueInformationBlock): string {
  // ignore the extension bit in this selection
  const vife0 = vib.vife[0] & MbusDibVif.WITHOUT_EXTENSION;

  if ((vife0 & 0x7c) === 0x00) {
    // E000 00nn — Credit of 10^(nn-3)
    return `Credit of ${unitPrefix((vife0 & 0x03) - 3)} of the nominal local legal currency units`;
    // VIFE = E000 01nn Debit of 10nn-3 of the nominal local legal currency units
  } else if ((vife0 & 0x7c) === 0x04) {
    // E000 01nn — Debit of 10^(nn-3)
    return `Debit of ${unitPrefix((vife0 & 0x03) - 3)} of the nominal local legal currency units`;
  } else if (vife0 === 0x08) {
    return 'Access Number (transmission count)';
  } else if (vife0 === 0x09) {
    return 'Medium (as in fixed header)';
  } else if (vife0 === 0x0a) {
    return 'Manufacturer (as in fixed header)';
  } else if (vife0 === 0x0b) {
    return 'Parameter set identification';
  } else if (vife0 === 0x0c) {
    return 'Model / Version';
  } else if (vife0 === 0x0d) {
    return 'Hardware version';
  } else if (vife0 === 0x0e) {
    return 'Firmware version';
  } else if (vife0 === 0x0f) {
    return 'Software version';
  } else if (vife0 === 0x10) {
    return 'Customer location';
  } else if (vife0 === 0x11) {
    return 'Customer';
  } else if (vife0 === 0x12) {
    return 'Access Code User';
  } else if (vife0 === 0x13) {
    return 'Access Code Operator';
  } else if (vife0 === 0x14) {
    return 'Access Code System Operator';
  } else if (vife0 === 0x15) {
    return 'Access Code Developer';
  } else if (vife0 === 0x16) {
    return 'Password';
  } else if (vife0 === 0x17) {
    return 'Error flags';
  } else if (vife0 === 0x18) {
    return 'Error mask';
  } else if (vife0 === 0x19) {
    return 'Reserved';
  } else if (vife0 === 0x1a) {
    return 'Digital output (binary)';
  } else if (vife0 === 0x1b) {
    return 'Digital input (binary)';
  } else if (vife0 === 0x1c) {
    return 'Baudrate';
  } else if (vife0 === 0x1d) {
    return 'response delay time';
  } else if (vife0 === 0x1e) {
    return 'Retry';
  } else if (vife0 === 0x1f) {
    return 'Reserved';
  } else if (vife0 === 0x20) {
    return 'First storage # for cyclic storage';
  } else if (vife0 === 0x21) {
    return 'Last storage # for cyclic storage';
  } else if (vife0 === 0x22) {
    return 'Size of storage block';
  } else if (vife0 === 0x23) {
    return 'Reserved';
  } else if ((vife0 & 0x7c) === 0x24) {
    // E010 01nn — Storage interval [sec..day]
    return `Storage interval ${unitDurationNn(vife0 & 0x03)}`;
  } else if (vife0 === 0x28) {
    return 'Storage interval month(s)';
  } else if (vife0 === 0x29) {
    return 'Storage interval year(s)';
  } else if (vife0 === 0x2a) {
    return 'Reserved';
  } else if (vife0 === 0x2b) {
    return 'Reserved';
  } else if ((vife0 & 0x7c) === 0x2c) {
    // E010 11nn — Duration since last readout [sec..day]
    return `Duration since last readout ${unitDurationNn(vife0 & 0x03)}`;
  } else if (vife0 === 0x30) {
    return 'Start (date/time) of tariff';
  } else if ((vife0 & 0x7c) === 0x30) {
    // E011 00nn — Duration of tariff [min..days]
    return `Duration of tariff ${unitDurationNn(vife0 & 0x03)}`;
  } else if ((vife0 & 0x7c) === 0x34) {
    // E011 01nn — Period of tariff [sec..day]
    return `Period of tariff ${unitDurationNn(vife0 & 0x03)}`;
  } else if (vife0 === 0x38) {
    return 'Period of tariff months(s)';
  } else if (vife0 === 0x39) {
    return 'Period of tariff year(s)';
  } else if (vife0 === 0x3a) {
    return 'dimensionless / no VIF';
  } else if (vife0 === 0x3b) {
    return 'Reserved';
  } else if ((vife0 & 0x7c) === 0x3c) {
    return 'Reserved';
  } else if ((vife0 & 0x70) === 0x40) {
    // E100 nnnn — 10^(nnnn-9) V
    return `${unitPrefix((vife0 & 0x0f) - 9)} V`;
  } else if ((vife0 & 0x70) === 0x50) {
    // E101 nnnn — 10^(nnnn-12) A
    return `${unitPrefix((vife0 & 0x0f) - 12)} A`;
  } else if (vife0 === 0x60) {
    return 'Reset counter';
  } else if (vife0 === 0x61) {
    return 'Cumulation counter';
  } else if (vife0 === 0x62) {
    return 'Control signal';
  } else if (vife0 === 0x63) {
    return 'Day of week';
  } else if (vife0 === 0x64) {
    return 'Week number';
  } else if (vife0 === 0x65) {
    return 'Time point of day change';
  } else if (vife0 === 0x66) {
    return 'State of parameter activation';
  } else if (vife0 === 0x67) {
    return 'Special supplier information';
  } else if ((vife0 & 0x7c) === 0x68) {
    // E110 10pp — Duration since last cumulation [hour..year]
    return `Duration since last cumulation ${unitDurationPp(vife0 & 0x03)}`;
  } else if ((vife0 & 0x7c) === 0x6c) {
    // E110 11pp — Operating time battery [hour..year]
    return `Operating time battery ${unitDurationPp(vife0 & 0x03)}`;
  } else if (vife0 === 0x70) {
    return 'Date and time of battery change';
  } else if ((vife0 & 0x70) === 0x70) {
    return 'Reserved VIF extension';
  } else {
    return `Unrecognized VIF 0xFD extension: 0x${toHex(vife0)}`;
  }
}
