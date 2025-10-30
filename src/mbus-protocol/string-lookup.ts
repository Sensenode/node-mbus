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
