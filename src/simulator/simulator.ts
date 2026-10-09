/**
 * Simulator module for SensorSure
 * Generates continuous streaming sensor readings (~1 sample/sec) with realistic noise
 * and supports test scenarios (Normal, Out of range, Spike, Stuck, Missing).
 */

import { SensorProfile } from '../data/sensors';

export type TestScenario = 'normal' | 'out-of-range' | 'spike' | 'stuck' | 'missing';

export interface SimulatorState {
  currentValue: number;
  lastTimestamp: number;
  stuckValue: number;
  isMissing: boolean;
}

export class SensorSimulator {
  private profile: SensorProfile;
  private scenario: TestScenario = 'normal';
  private currentValue: number;
  private stuckValue: number;
  private lastUpdateTime: number = 0;
  private tickCount: number = 0;

  constructor(profile: SensorProfile) {
    this.profile = profile;
    this.currentValue = (profile.datasheetRange.min + profile.datasheetRange.max) / 2;
    this.stuckValue = this.currentValue;
  }

  public setProfile(profile: SensorProfile) {
    this.profile = profile;
    this.currentValue = (profile.datasheetRange.min + profile.datasheetRange.max) / 2;
    this.stuckValue = this.currentValue;
    this.tickCount = 0;
  }

  public setScenario(scenario: TestScenario) {
    this.scenario = scenario;
    if (scenario === 'stuck') {
      this.stuckValue = this.currentValue;
    }
  }

  public getScenario(): TestScenario {
    return this.scenario;
  }

  public getNextReading(): { timestamp: number; value: number; isValid: boolean } {
    const now = Date.now();
    this.tickCount++;

    if (this.scenario === 'missing') {
      return {
        timestamp: now,
        value: this.currentValue,
        isValid: false, // simulated transmission drop
      };
    }

    if (this.scenario === 'stuck') {
      return {
        timestamp: now,
        value: this.stuckValue,
        isValid: true,
      };
    }

    if (this.scenario === 'out-of-range') {
      // Force value well above maxLimit
      const val = this.profile.datasheetRange.max + (this.profile.id === 'potentiometer' ? 250 : 25);
      return {
        timestamp: now,
        value: Number(val.toFixed(2)),
        isValid: true,
      };
    }

    if (this.scenario === 'spike') {
      // Occasional huge jump every 6 ticks
      if (this.tickCount % 6 === 0) {
        const spikeVal = this.profile.datasheetRange.max * 1.5;
        return {
          timestamp: now,
          value: Number(spikeVal.toFixed(2)),
          isValid: true,
        };
      }
    }

    // Normal mode: random walk with Gaussian-like noise within datasheet range
    const rangeSpan = this.profile.datasheetRange.max - this.profile.datasheetRange.min;
    const maxDelta = rangeSpan * 0.03;
    const delta = (Math.random() - 0.48) * maxDelta;
    
    this.currentValue += delta;

    // Clamp within valid datasheet bounds with a little breathing room
    if (this.currentValue < this.profile.datasheetRange.min) {
      this.currentValue = this.profile.datasheetRange.min + rangeSpan * 0.05;
    }
    if (this.currentValue > this.profile.datasheetRange.max) {
      this.currentValue = this.profile.datasheetRange.max - rangeSpan * 0.05;
    }

    return {
      timestamp: now,
      value: Number(this.currentValue.toFixed(2)),
      isValid: true,
    };
  }
}
