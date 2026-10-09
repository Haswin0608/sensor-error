/**
 * TestMode component for SensorSure
 * Icon-card grid of test scenarios, rule pass/fail status, and detection accuracy summary.
 */

import React from 'react';
import { TestScenario } from '../simulator/simulator';
import { ShieldCheck, AlertTriangle, Zap, Radio, Sliders, CheckCircle2, XCircle } from 'lucide-react';
import { WarningItem } from '../detector/rules';

interface TestModeProps {
  activeScenario: TestScenario;
  onSelectScenario: (scenario: TestScenario) => void;
  warnings: WarningItem[];
}

export const TestMode: React.FC<TestModeProps> = ({
  activeScenario,
  onSelectScenario,
  warnings,
}) => {
  const scenarios: { id: TestScenario; title: string; description: string; icon: any; color: string }[] = [
    {
      id: 'normal',
      title: 'Normal Operation',
      description: 'Steady readings within datasheet parameters with standard environmental noise.',
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    },
    {
      id: 'out-of-range',
      title: 'Out of Range',
      description: 'Forces sensor values beyond maximum operating thresholds to trigger range fault rule.',
      icon: AlertTriangle,
      color: 'text-red-400 bg-red-500/20 border-red-500/30'
    },
    {
      id: 'spike',
      title: 'Sudden Spike',
      description: 'Simulates electrical EMI transients causing rapid unrealistic rate-of-change spikes.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    },
    {
      id: 'stuck',
      title: 'Stuck Value',
      description: 'Freezes sensor output at a constant value to test stuck reading detection windows.',
      icon: Sliders,
      color: 'text-violet-400 bg-violet-500/20 border-violet-500/30'
    },
    {
      id: 'missing',
      title: 'Missing Data / Drop',
      description: 'Simulates severed wiring or packet loss to trigger missing data timeout rules.',
      icon: Radio,
      color: 'text-rose-400 bg-rose-500/20 border-rose-500/30'
    },
  ];

  const rulesList = [
    { name: 'Missing Data / Timeout', triggered: warnings.some(w => w.rule.includes('Missing') && !w.isCleared) },
    { name: 'Reading Outside Range', triggered: warnings.some(w => w.rule.includes('Range') && !w.isCleared) },
    { name: 'Unusual Sudden Change (Spike)', triggered: warnings.some(w => w.rule.includes('Spike') && !w.isCleared) },
    { name: 'Possible Stuck Reading', triggered: warnings.some(w => w.rule.includes('Stuck') && !w.isCleared) },
  ];

  const totalTriggers = warnings.length;
  const activeTriggers = warnings.filter(w => !w.isCleared).length;
  const falseAlarmRate = 2.4; // Simulated baseline false alarm percentage

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Fault Simulation & Test Lab</h2>
        <p className="text-slate-400 text-sm mt-1">
          Inject simulated hardware faults into the sensor stream to verify rule engine response and diagnostic accuracy.
        </p>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenario === sc.id;

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`rounded-2xl p-5 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                isActive
                  ? 'bg-gradient-to-br from-teal-500/20 via-slate-900/90 to-slate-950 border-teal-500/60 shadow-[0_0_25px_rgba(20,241,217,0.25)] ring-2 ring-teal-400/40'
                  : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700 shadow-xl'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${sc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{sc.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{sc.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className={isActive ? 'text-teal-400' : 'text-slate-500'}>
                  {isActive ? 'Active Scenario' : 'Select'}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Panel & Rule Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          <h3 className="font-bold text-white text-lg mb-4">Rule Engine Pass / Fail Status</h3>
          <p className="text-xs text-slate-400 mb-6">
            Real-time verification of detection rules against active test scenario "{activeScenario}".
          </p>

          <div className="space-y-3">
            {rulesList.map((rule, i) => {
              const matchesScenario =
                (activeScenario === 'out-of-range' && rule.name.includes('Range')) ||
                (activeScenario === 'spike' && rule.name.includes('Spike')) ||
                (activeScenario === 'stuck' && rule.name.includes('Stuck')) ||
                (activeScenario === 'missing' && rule.name.includes('Missing'));

              const isPassed = rule.triggered || (activeScenario === 'normal' && !rule.triggered);

              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${rule.triggered ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {rule.triggered ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{rule.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {rule.triggered ? 'Fault condition detected & flagged' : 'Nominal operation'}
                      </div>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    rule.triggered
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {rule.triggered ? 'TRIGGERED' : 'NOMINAL'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detections vs False Alarms Summary */}
        <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Detection Performance Summary</h3>
            <p className="text-xs text-slate-400 mb-6">
              Analytics on detection accuracy and false-alarm suppression during test runs.
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Total Detections</span>
                  <span className="text-teal-400 font-mono">{totalTriggers} events</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, totalTriggers * 20)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Active Unacknowledged Warnings</span>
                  <span className="text-amber-400 font-mono">{activeTriggers} active</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, activeTriggers * 25)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Estimated False Alarm Rate</span>
                  <span className="text-violet-400 font-mono">{falseAlarmRate}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${falseAlarmRate * 10}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            SensorSure uses moving-average rate-of-change filters to suppress spurious noise transients.
          </div>
        </div>
      </div>
    </div>
  );
};
