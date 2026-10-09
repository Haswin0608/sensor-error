/**
 * Diagnostics component for SensorSure
 * Warning detail card, numbered checklist, fault history table with filters and clear button.
 */

import React, { useState } from 'react';
import { WarningItem } from '../detector/rules';
import { AlertTriangle, XCircle, CheckCircle2, Trash2, Filter, ShieldCheck } from 'lucide-react';

interface DiagnosticsProps {
  warnings: WarningItem[];
  onClearWarning: (id: string) => void;
  onClearAllWarnings: () => void;
}

export const Diagnostics: React.FC<DiagnosticsProps> = ({
  warnings,
  onClearWarning,
  onClearAllWarnings,
}) => {
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(
    warnings.length > 0 ? warnings[0].id : null
  );
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'fault'>('all');

  const filteredWarnings = warnings.filter(w => {
    if (severityFilter === 'all') return true;
    return w.severity === severityFilter;
  });

  const activeSelectedWarning = warnings.find(w => w.id === selectedWarningId) || warnings[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sensor Diagnostics & Troubleshooting</h2>
          <p className="text-slate-400 text-sm mt-1">
            Detailed root-cause analysis, evidence logs, and numbered ECE troubleshooting checklists.
          </p>
        </div>

        {warnings.length > 0 && (
          <button
            onClick={onClearAllWarnings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Warnings
          </button>
        )}
      </div>

      {warnings.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-16 text-center shadow-xl">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-bold text-white mb-2">No Faults or Warnings Detected</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            All connected sensors are operating within nominal parameters. When anomalies occur, diagnostic checklists and evidence logs will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Warning Detail Card (Star of Diagnostics) */}
          {activeSelectedWarning ? (
            <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      activeSelectedWarning.severity === 'fault'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {activeSelectedWarning.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(activeSelectedWarning.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-xs text-teal-400 font-semibold bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/20">
                    {activeSelectedWarning.sensorName}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-3">{activeSelectedWarning.rule}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                  {activeSelectedWarning.explanation}
                </p>

                {/* Evidence Box */}
                <div className="mb-6 bg-black/40 border border-slate-800 rounded-2xl p-4 font-mono text-xs">
                  <div className="text-slate-400 mb-2 font-semibold uppercase tracking-wider text-[10px]">Evidence Log:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500">Actual Value:</span>
                      <div className="text-white font-bold text-sm mt-0.5">{activeSelectedWarning.evidence.actual}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Configured Limit:</span>
                      <div className="text-teal-400 font-bold text-sm mt-0.5">{activeSelectedWarning.evidence.threshold}</div>
                    </div>
                  </div>
                </div>

                {/* Numbered What to Check Checklist */}
                <div className="space-y-3 mb-6">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">What to Check (Troubleshooting Steps):</div>
                  {activeSelectedWarning.suggestedSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                        {i + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 italic">
                  Warnings indicate possible issues, not confirmed faults.
                </span>
                {!activeSelectedWarning.isCleared && (
                  <button
                    onClick={() => onClearWarning(activeSelectedWarning.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold text-xs hover:opacity-95 transition shadow-lg shadow-teal-500/20 cursor-pointer"
                  >
                    Acknowledge & Clear
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Fault History Table & List */}
          <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-white text-base">Warning History</h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setSeverityFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${severityFilter === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSeverityFilter('fault')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${severityFilter === 'fault' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Faults
                </button>
                <button
                  onClick={() => setSeverityFilter('warning')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${severityFilter === 'warning' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Warns
                </button>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[550px] pr-1">
              {filteredWarnings.map((w) => {
                const isSelected = activeSelectedWarning?.id === w.id;
                const isFault = w.severity === 'fault';

                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWarningId(w.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-500/10'
                        : 'bg-slate-950/50 hover:bg-slate-950/80 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isFault ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isFault ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">{w.rule}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{w.sensorName}</span>
                          <span>•</span>
                          <span>{new Date(w.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                        w.isCleared
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isFault ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {w.isCleared ? 'Cleared' : w.severity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
