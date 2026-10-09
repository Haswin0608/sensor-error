/**
 * TopBar component for SensorSure
 * Displays selected sensor info, simulation indicator, and theme toggle.
 */

import React from 'react';
import { SensorProfile } from '../data/sensors';
import { StatusBadge } from './StatusBadge';
import { Radio, Moon, Sun, Cpu } from 'lucide-react';
import { TestScenario } from '../simulator/simulator';

interface TopBarProps {
  selectedSensor: SensorProfile;
  status: 'Normal' | 'Warning' | 'Fault';
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeScenario: TestScenario;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedSensor,
  status,
  isDarkMode,
  onToggleTheme,
  activeScenario,
}) => {
  return (
    <header className="h-20 bg-[#080C17]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span>Active Profile:</span>
          <span className="text-white font-semibold">{selectedSensor.name}</span>
        </div>
        
        {/* Pulsing simulated data indicator */}
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-xl text-xs text-teal-300 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <Radio className="w-3.5 h-3.5" />
          <span>Simulated Stream (~1Hz)</span>
          {activeScenario !== 'normal' && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/30">
              Scenario: {activeScenario}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <StatusBadge status={status} size="sm" />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer shadow-sm"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
