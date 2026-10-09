/**
 * Sidebar component for SensorSure
 * Navigation sidebar with icons, wordmark, and active glowing bar.
 * Collapses to a bottom tab bar on mobile screens.
 */

import React from 'react';
import { LayoutDashboard, Sliders, ShieldAlert, FlaskConical, Cpu } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'select' | 'diagnostics' | 'test';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeWarningsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeWarningsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'select', label: 'Select Sensor', icon: Sliders },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      icon: ShieldAlert,
      badge: activeWarningsCount > 0 ? activeWarningsCount : null,
    },
    { id: 'test', label: 'Test Mode', icon: FlaskConical },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#080C17]/90 backdrop-blur-xl border-r border-slate-800/85 z-30 shrink-0">
        {/* Logo / Wordmark */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-violet-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Cpu className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              SensorSure
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">ECE / IoT Fault Monitor</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/15 via-teal-500/5 to-transparent text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {/* Active glowing accent bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 rounded-r shadow-[0_0_10px_#14F1D9]" />
                )}
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 m-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">Troubleshooting Assistant</div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Warnings indicate possible issues, not confirmed hardware faults.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C17]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative transition-all cursor-pointer ${
                isActive ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge !== null && (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
