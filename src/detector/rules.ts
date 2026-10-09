/**
 * Detection engine rules for SensorSure
 * Pure functions analyzing reading history against sensor profiles & thresholds.
 */

import { SensorProfile, SensorThresholds } from '../data/sensors';

export interface Reading {
  timestamp: number; // epoch ms
  value: number;
  isValid: boolean;
}

export type Severity = 'warning' | 'fault';

export interface WarningItem {
  id: string;
  rule: string;
  severity: Severity;
  timestamp: number;
  sensorId: string;
  sensorName: string;
  evidence: {
    actual: number | string;
    threshold: number | string;
    unit: string;
  };
  explanation: string;
  suggestedSteps: string[];
  isCleared: boolean;
  clearedAt?: number;
}

export interface DetectionResult {
  warnings: WarningItem[];
  status: 'Normal' | 'Warning' | 'Fault';
}

/**
 * Runs all detection rules against the recent history for a sensor
 */
export function detectFaults(
  profile: SensorProfile,
  thresholds: SensorThresholds,
  history: Reading[],
  referenceValue?: number
): DetectionResult {
  const warnings: WarningItem[] = [];
  const now = Date.now();

  if (history.length === 0) {
    return { warnings: [], status: 'Normal' };
  }

  const latest = history[history.length - 1];

  // 1. Missing Data Check
  const timeSinceLastReading = (now - latest.timestamp) / 1000;
  if (!latest.isValid || timeSinceLastReading > thresholds.missingTimeoutSeconds) {
    warnings.push({
      id: `missing-${profile.id}-${latest.timestamp}`,
      rule: 'Missing Data / Timeout',
      severity: 'fault',
      timestamp: now,
      sensorId: profile.id,
      sensorName: profile.name,
      evidence: {
        actual: `${timeSinceLastReading.toFixed(1)}s since last packet`,
        threshold: `> ${thresholds.missingTimeoutSeconds}s timeout`,
        unit: 'seconds'
      },
      explanation: `Possible sensor data interruption. No valid reading has been received within the configured timeout window of ${thresholds.missingTimeoutSeconds}s.`,
      suggestedSteps: [
        'Check physical wiring connections (VCC, GND, and signal/data pins).',
        'Inspect power supply stability and multimeter voltage rails.',
        'Verify sensor initialization code and baud/clock rates in your microcontroller sketch.'
      ],
      isCleared: false
    });
  }

  // 2. Range Check
  if (latest.isValid) {
    if (latest.value < thresholds.minLimit || latest.value > thresholds.maxLimit) {
      warnings.push({
        id: `range-${profile.id}-${latest.timestamp}`,
        rule: 'Reading Outside Range',
        severity: latest.value < thresholds.minLimit - 5 || latest.value > thresholds.maxLimit + 5 ? 'fault' : 'warning',
        timestamp: now,
        sensorId: profile.id,
        sensorName: profile.name,
        evidence: {
          actual: latest.value,
          threshold: `[${thresholds.minLimit} - ${thresholds.maxLimit}] ${profile.units}`,
          unit: profile.units
        },
        explanation: `Possible calibration or environment anomaly. The reading (${latest.value} ${profile.units}) is outside the configured operating limits.`,
        suggestedSteps: [
          'Verify if the environment has genuinely exceeded normal operational parameters.',
          'Check analog reference voltage (AREF) or digital pull-up configurations.',
          'Inspect sensor for physical damage, condensation, or dust contamination.'
        ],
        isCleared: false
      });
    }

    // 3. Spike / Rate of Change Check
    if (history.length >= 2) {
      const prev = history[history.length - 2];
      const dt = (latest.timestamp - prev.timestamp) / 1000;
      if (dt > 0) {
        const changeRate = Math.abs(latest.value - prev.value) / dt;
        if (changeRate > thresholds.maxChangePerSecond) {
          warnings.push({
            id: `spike-${profile.id}-${latest.timestamp}`,
            rule: 'Unusual Sudden Change (Spike)',
            severity: 'warning',
            timestamp: now,
            sensorId: profile.id,
            sensorName: profile.name,
            evidence: {
              actual: `${changeRate.toFixed(1)} ${profile.units}/s`,
              threshold: `Max ${thresholds.maxChangePerSecond} ${profile.units}/s`,
              unit: `${profile.units}/s`
            },
            explanation: `Possible electrical interference or transient noise. The rate of change between consecutive samples exceeded the allowed physical threshold.`,
            suggestedSteps: [
              'Check for electromagnetic interference (EMI) from nearby motors, relays, or switching power supplies.',
              'Add a hardware decoupling capacitor (0.1µF ceramic) across VCC and GND near the sensor.',
              'Implement a software moving average or exponential smoothing filter.'
            ],
            isCleared: false
          });
        }
      }
    }

    // 4. Stuck Value Check
    if (history.length >= 5) {
      const windowSeconds = thresholds.stuckWindowSeconds;
      const windowCutoff = now - windowSeconds * 1000;
      const recentHistory = history.filter(h => h.timestamp >= windowCutoff);

      if (recentHistory.length >= 5) {
        const firstVal = recentHistory[0].value;
        const allSame = recentHistory.every(h => Math.abs(h.value - firstVal) < 0.001);

        if (allSame) {
          warnings.push({
            id: `stuck-${profile.id}-${latest.timestamp}`,
            rule: 'Possible Stuck Reading',
            severity: 'warning',
            timestamp: now,
            sensorId: profile.id,
            sensorName: profile.name,
            evidence: {
              actual: `${firstVal} ${profile.units} for ${windowSeconds}s`,
              threshold: `No variation in ≥ ${windowSeconds}s`,
              unit: profile.units
            },
            explanation: `Possible sensor lockup or frozen I/O buffer. The value has not changed for ${windowSeconds} seconds. Check whether the sensor responds to a change in its environment. A steady reading alone does not prove a fault.`,
            suggestedSteps: [
              'Expose the sensor to a controlled environmental change (e.g., breathe near humidity sensor or move ultrasonic target).',
              'Check for bus lockup on I2C/SPI/OneWire lines (may require power cycling).',
              'Verify that the microcontroller interrupt or polling loop is not blocked by a delay() function.'
            ],
            isCleared: false
          });
        }
      }
    }

    // 5. Reference Comparison Check
    if (referenceValue !== undefined && thresholds.referenceTolerance !== undefined) {
      const diff = Math.abs(latest.value - referenceValue);
      if (diff > thresholds.referenceTolerance) {
        warnings.push({
          id: `ref-${profile.id}-${latest.timestamp}`,
          rule: 'Possible Sensor Disagreement',
          severity: 'warning',
          timestamp: now,
          sensorId: profile.id,
          sensorName: profile.name,
          evidence: {
            actual: `Sensor: ${latest.value} vs Ref: ${referenceValue}`,
            threshold: `Max tolerance ±${thresholds.referenceTolerance} ${profile.units}`,
            unit: profile.units
          },
          explanation: `Possible calibration drift or sensor degradation. The reading differs significantly from the reference baseline or secondary sensor.`,
          suggestedSteps: [
            'Compare against a calibrated handheld multimeter or reference instrument.',
            'Perform a zero-point or span recalibration procedure.',
            'Check for thermal gradients or placement bias between sensors.'
          ],
          isCleared: false
        });
      }
    }
  }

  // Determine overall status
  let status: 'Normal' | 'Warning' | 'Fault' = 'Normal';
  if (warnings.some(w => w.severity === 'fault' && !w.isCleared)) {
    status = 'Fault';
  } else if (warnings.some(w => w.severity === 'warning' && !w.isCleared)) {
    status = 'Warning';
  }

  return { warnings, status };
}
