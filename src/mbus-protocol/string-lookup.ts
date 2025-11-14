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

function bytesToNumber(bytes: number[]): number {
  // Ripped from original, cleaner ways exist but original code actually calls this with size == 3 at some point
  const isNegative = bytes[bytes.length - 1] & 0x80;

  let value = 0;

  for (let i = bytes.length; i > 0; i--) {
    if (isNegative) {
      value = (value << 8) + (bytes[i - 1] ^ 0xff);
    } else {
      value = (value << 8) + bytes[i - 1];
    }
  }

  if (isNegative) {
    value = -(value + 1);
  }

  return value;
}

export function bcdDecode(bcd: number[]): number {
  let value = 0;

  for (let i = bcd.length; i > 0; i--) {
    value = value * 100 + ((bcd[i - 1] >> 4) & 0x0f) * 10 + (bcd[i - 1] & 0x0f);
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
  let result = -1;
  let bit_index = 0;

  if (record.header.dib.dife.length > 0) {
    result = 0;

    record.header.dib.dife.forEach((dife) => {
      result |= ((dife & MbusDataRecordDifeMask.TARIFF) >> 6) << bit_index;
      bit_index++;
    });
  }

  return result;
}

export function recordUnitString(vib: MbusValueInformationBlock): string {
  if (vib.vif === 0xfb) {
    // first type of VIF extention: see table 8.4.4
    if (vib.vife.length == 0) {
      return 'Missing VIF extension';
    }

    return vibUnitLookup(vib);
  } else if (vib.vif === 0xfd) {
    // first type of VIF extention: see table 8.4.4
    if (vib.vife.length === 0) {
      return 'Missing VIF extension';
    }

    return vibUnitLookup(vib);
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

export function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}

export function vifUnitLookup(vif: number): string {
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

export function vibUnitLookup(vib: MbusValueInformationBlock): string {
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
