/**
 * Sensor profiles for SensorSure
 * NOTE: All values are verified against each sensor's datasheet.
 * Manufacturer's measurement range is NOT the same as a fault threshold.
 * Thresholds can be customized by users in the UI.
 */

export interface SensorThresholds {
  minLimit: number;
  maxLimit: number;
  maxChangePerSecond: number;
  stuckWindowSeconds: number;
  missingTimeoutSeconds: number;
  referenceTolerance?: number;
}

export interface SensorProfile {
  id: string;
  name: string;
  type: string;
  subType?: string; // For DHT11 (temperature or humidity)
  units: string;
  description: string;
  datasheetRange: { min: number; max: number };
  defaultThresholds: SensorThresholds;
  iconName: 'thermometer' | 'activity' | 'sliders';
  pinout: string[];
  typicalIssues: string[];
}

export const SENSOR_PROFILES: SensorProfile[] = [
  {
    id: 'dht11-temp',
    name: 'DHT11 (Temperature)',
    type: 'Temperature & Humidity',
    subType: 'temperature',
    units: '°C',
    description: 'Low-cost digital temperature and humidity sensor using a thermistor and capacitive humidity sensor.',
    datasheetRange: { min: 0, max: 50 },
    defaultThresholds: {
      minLimit: 0,
      maxLimit: 50,
      maxChangePerSecond: 5.0, // °C/s max realistic environmental change
      stuckWindowSeconds: 25,
      missingTimeoutSeconds: 5,
      referenceTolerance: 3.5,
    },
    iconName: 'thermometer',
    pinout: ['VCC (3.3V-5V)', 'Data (Digital Pin)', 'NC', 'GND'],
    typicalIssues: [
      'Pull-up resistor missing on Data line',
      'Inadequate polling interval (< 1 second causes errors)',
      'Self-heating due to continuous high current draw'
    ]
  },
  {
    id: 'dht11-humidity',
    name: 'DHT11 (Humidity)',
    type: 'Temperature & Humidity',
    subType: 'humidity',
    units: '%',
    description: 'Relative humidity measurement channel of the DHT11 module.',
    datasheetRange: { min: 20, max: 90 },
    defaultThresholds: {
      minLimit: 20,
      maxLimit: 90,
      maxChangePerSecond: 10.0, // %/s
      stuckWindowSeconds: 30,
      missingTimeoutSeconds: 5,
      referenceTolerance: 10.0,
    },
    iconName: 'thermometer',
    pinout: ['VCC (3.3V-5V)', 'Data (Digital Pin)', 'NC', 'GND'],
    typicalIssues: [
      'Condensation on sensor substrate',
      'Slow response time in enclosed stagnant air',
      'Power supply voltage drop (< 3V)'
    ]
  },
  {
    id: 'hc-sr04',
    name: 'HC-SR04 Ultrasonic',
    type: 'Distance Measurement',
    units: 'cm',
    description: 'Ultrasonic ranging module emitting 40kHz sound waves to measure distance from 2cm to 400cm.',
    datasheetRange: { min: 2, max: 400 },
    defaultThresholds: {
      minLimit: 2,
      maxLimit: 400,
      maxChangePerSecond: 150.0, // cm/s
      stuckWindowSeconds: 20,
      missingTimeoutSeconds: 4,
      referenceTolerance: 25.0,
    },
    iconName: 'activity',
    pinout: ['VCC (5V)', 'Trig (Digital Out)', 'Echo (Digital In)', 'GND'],
    typicalIssues: [
      'Soft or angled target surfaces absorbing sound waves',
      'Trigger pulse too short or missing GND common reference',
      'Echo pin stuck HIGH due to timeout without return pulse'
    ]
  },
  {
    id: 'potentiometer',
    name: 'Rotary Potentiometer',
    type: 'Analog Voltage Divider',
    units: 'ADC',
    description: 'Three-terminal adjustable resistor acting as an adjustable voltage divider connected to ADC.',
    datasheetRange: { min: 0, max: 1023 },
    defaultThresholds: {
      minLimit: 0,
      maxLimit: 1023,
      maxChangePerSecond: 500.0, // ADC counts / s
      stuckWindowSeconds: 15,
      missingTimeoutSeconds: 3,
      referenceTolerance: 100.0,
    },
    iconName: 'sliders',
    pinout: ['VCC (5V/3.3V)', 'Wiper (Analog Pin A0)', 'GND'],
    typicalIssues: [
      'Wiper noise / jitter from dust or oxidation',
      'Loose wiring causing floating ADC readings',
      'Missing decoupling capacitor leading to power rail ripple'
    ]
  }
];
