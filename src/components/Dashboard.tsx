/**
 * Dashboard component for SensorSure
 * Hero status card, live reading in huge monospace, live SVG chart, stat cards,
 * and recent warnings timeline.
 */

import React from 'react';
import { SensorProfile } from '../data/sensors';
import { Reading, WarningItem } from '../detector/rules';
import { StatusBadge } from './StatusBadge';
import { LiveChart } from './LiveChart';
import { Activity, ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

interface DashboardProps {
  selectedSensor: SensorProfile;
  readings: Reading[];
  warnings: WarningItem[];
  status: 'Normal' | 'Warning' | 'Fault';
  onClearWarning: (id: string) => void;
  onNavigateDiagnostics: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedSensor,
  readings,
  warnings,
  status,
  onClearWarning,
  onNavigateDiagnostics,
}) => {
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  // Compute stats
  const validValues = readings.filter(r => r.isValid).map(r => r.value);
  const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
  const maxVal = validValues.length > 0 ? Math.max(...validValues) : 0;
  const avgVal = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
  const activeWarnings = warnings.filter(w => !w.isCleared);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Status Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-2xl border border-slate-800/80 p-8 shadow-2xl">
        {/* Background glow circle */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
          status === 'Fault' ? 'bg-red-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-teal-500'
        }`} />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                {selectedSensor.type}
              </span>
              <span className="text-xs text-slate-400">Datasheet Range: {selectedSensor.datasheetRange.min} - {selectedSensor.datasheetRange.max} {selectedSensor.units}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{selectedSensor.name}</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">{selectedSensor.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={status} size="lg" />
          </div>
        </div>

        {/* Live Reading Big Monospace */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Live Reading</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                {latestReading && latestReading.isValid ? latestReading.value.toFixed(2) : '---'}
              </span>
              <span className="text-teal-400 font-bold text-lg">{selectedSensor.units}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {latestReading ? `Updated ${new Date(latestReading.timestamp).toLocaleTimeString()}` : 'No signal'}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Session Min</div>
              <div className="font-mono text-lg font-bold text-white">{minVal.toFixed(1)} {selectedSensor.units}</div>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Session Max</div>
              <div className="font-mono text-lg font-bold text-white">{maxVal.toFixed(1)} {selectedSensor.units}</div>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Session Average</div>
              <div className="font-mono text-lg font-bold text-white">{avgVal.toFixed(1)} {selectedSensor.units}</div>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Active Warnings</div>
              <div className="font-mono text-lg font-bold text-amber-400">{activeWarnings.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chart Section */}
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-base">Real-Time Waveform & Anomalies</h3>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Normal Stream</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Warning Marker</span>
          </div>
        </div>

        <LiveChart readings={readings} profile={selectedSensor} warnings={warnings} />
      </div>

      {/* Recent Warnings & Troubleshooting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Recent Warnings & Fault Timeline</h3>
            </div>
            <button
              onClick={onNavigateDiagnostics}
              className="text-xs text-teal-400 hover:underline font-medium cursor-pointer"
            >
              View all diagnostics &rarr;
            </button>
          </div>

          {warnings.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/30 rounded-2xl border border-slate-800/50">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
              <div className="text-white font-semibold text-sm">All clear. No warnings yet.</div>
              <p className="text-xs text-slate-400 mt-1">Sensor data is stable and within operating parameters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {warnings.slice(0, 4).map((w) => {
                const isFault = w.severity === 'fault';
                return (
                  <div
                    key={w.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isFault
                        ? 'bg-red-950/20 border-red-500/30 text-red-200'
                        : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${isFault ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{w.rule}</span>
                          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${isFault ? 'bg-red-500/30 text-red-300' : 'bg-amber-500/30 text-amber-300'}`}>
                            {w.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{w.explanation}</p>
                        <div className="text-[11px] text-slate-400 mt-2 font-mono">
                          Actual: <span className="text-white">{w.evidence.actual}</span> | Threshold: <span className="text-white">{w.evidence.threshold}</span>
                        </div>
                      </div>
                    </div>

                    {!w.isCleared && (
                      <button
                        onClick={() => onClearWarning(w.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Pinout & Troubleshooting Tips */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-white text-base">Datasheet & Pinout</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">{selectedSensor.description}</p>

            <div className="space-y-2 mb-6">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pin Connections:</div>
              {selectedSensor.pinout.map((pin, i) => (
                <div key={i} className="bg-slate-950/50 border border-slate-800/80 px-3 py-2 rounded-xl text-xs font-mono text-teal-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  {pin}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Typical Gotchas:</div>
              {selectedSensor.typicalIssues.map((issue, i) => (
                <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
            "SensorSure is a troubleshooting assistant. Warnings indicate possible issues, not confirmed faults."
          </div>
        </div>
      </div>
    </div>
  );
};
