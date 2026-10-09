/**
 * SensorSelect component for SensorSure
 * Allows users to choose supported sensors, switch DHT11 sub-types, and customize thresholds.
 */

import React, { useState } from 'react';
import { SENSOR_PROFILES, SensorProfile, SensorThresholds } from '../data/sensors';
import { Thermometer, Activity, Sliders, CheckCircle2, SlidersHorizontal, Info } from 'lucide-react';

interface SensorSelectProps {
  selectedSensor: SensorProfile;
  onSelectSensor: (profile: SensorProfile) => void;
  thresholds: SensorThresholds;
  onUpdateThresholds: (newThresholds: SensorThresholds) => void;
}

export const SensorSelect: React.FC<SensorSelectProps> = ({
  selectedSensor,
  onSelectSensor,
  thresholds,
  onUpdateThresholds,
}) => {
  const [localThresholds, setLocalThresholds] = useState<SensorThresholds>(thresholds);

  // Update local state when selected sensor changes
  React.useEffect(() => {
    setLocalThresholds(selectedSensor.defaultThresholds);
  }, [selectedSensor]);

  const handleSliderChange = (key: keyof SensorThresholds, val: number) => {
    const updated = { ...localThresholds, [key]: val };
    setLocalThresholds(updated);
    onUpdateThresholds(updated);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'thermometer': return Thermometer;
      case 'activity': return Activity;
      case 'sliders': return Sliders;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Select Sensor Profile</h2>
        <p className="text-slate-400 text-sm mt-1">
          Choose an ECE / IoT sensor model to load its default calibration, datasheet limits, and fault detection rules.
        </p>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SENSOR_PROFILES.map((profile) => {
          const Icon = getIcon(profile.iconName);
          const isSelected = selectedSensor.id === profile.id;

          return (
            <div
              key={profile.id}
              onClick={() => onSelectSensor(profile)}
              className={`group relative rounded-3xl p-6 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-br from-teal-500/15 via-slate-900/90 to-slate-950 border-teal-500/60 shadow-[0_0_30px_rgba(20,241,217,0.2)]'
                  : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700 shadow-xl'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-teal-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-teal-500 text-slate-950 font-bold shadow-lg shadow-teal-500/30' : 'bg-slate-800 text-teal-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="text-xs uppercase tracking-wider font-semibold text-teal-400 mb-1">
                  {profile.type}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{profile.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4">{profile.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-teal-300 border border-slate-700/60">
                  {profile.units}
                </span>
                <span className="text-slate-400">
                  Range: {profile.datasheetRange.min}–{profile.datasheetRange.max}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Threshold Configuration Panel */}
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Customize Fault Thresholds for {selectedSensor.name}</h3>
            <p className="text-xs text-slate-400">
              Note: Manufacturer's measurement range is not the same as a fault threshold. Adjust sensitivity for your project environment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Min Limit */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Minimum Limit</label>
              <span className="font-mono text-sm text-teal-400 font-bold">{localThresholds.minLimit} {selectedSensor.units}</span>
            </div>
            <input
              type="range"
              min={selectedSensor.datasheetRange.min - 10}
              max={selectedSensor.datasheetRange.max / 2}
              value={localThresholds.minLimit}
              onChange={(e) => handleSliderChange('minLimit', Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Max Limit */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Maximum Limit</label>
              <span className="font-mono text-sm text-teal-400 font-bold">{localThresholds.maxLimit} {selectedSensor.units}</span>
            </div>
            <input
              type="range"
              min={selectedSensor.datasheetRange.max / 2}
              max={selectedSensor.datasheetRange.max * 1.5}
              value={localThresholds.maxLimit}
              onChange={(e) => handleSliderChange('maxLimit', Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Max Change Per Second (Spike) */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Max Spike Rate</label>
              <span className="font-mono text-sm text-teal-400 font-bold">{localThresholds.maxChangePerSecond} {selectedSensor.units}/s</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={localThresholds.maxChangePerSecond}
              onChange={(e) => handleSliderChange('maxChangePerSecond', Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Stuck Window Seconds */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Stuck Detection Window</label>
              <span className="font-mono text-sm text-teal-400 font-bold">{localThresholds.stuckWindowSeconds} sec</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={localThresholds.stuckWindowSeconds}
              onChange={(e) => handleSliderChange('stuckWindowSeconds', Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Missing Timeout */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Missing Data Timeout</label>
              <span className="font-mono text-sm text-teal-400 font-bold">{localThresholds.missingTimeoutSeconds} sec</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              value={localThresholds.missingTimeoutSeconds}
              onChange={(e) => handleSliderChange('missingTimeoutSeconds', Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3 text-xs text-teal-200">
          <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <p>
            All custom thresholds are held safely in browser memory for this session and automatically applied to real-time verification rules.
          </p>
        </div>
      </div>
    </div>
  );
};
