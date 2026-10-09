/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { SENSOR_PROFILES, SensorProfile, SensorThresholds } from './data/sensors';
import { Reading, WarningItem, detectFaults } from './detector/rules';
import { SensorSimulator, TestScenario } from './simulator/simulator';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { SensorSelect } from './components/SensorSelect';
import { Diagnostics } from './components/Diagnostics';
import { TestMode } from './components/TestMode';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedSensor, setSelectedSensor] = useState<SensorProfile>(SENSOR_PROFILES[0]);
  const [thresholds, setThresholds] = useState<SensorThresholds>(SENSOR_PROFILES[0].defaultThresholds);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [status, setStatus] = useState<'Normal' | 'Warning' | 'Fault'>('Normal');
  const [activeScenario, setActiveScenario] = useState<TestScenario>('normal');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [toastWarning, setToastWarning] = useState<WarningItem | null>(null);

  const [, startTransition] = useTransition();

  // Simulator instance ref
  const simulatorRef = useRef<SensorSimulator>(new SensorSimulator(SENSOR_PROFILES[0]));

  // Handle sensor switch
  const handleSelectSensor = (profile: SensorProfile) => {
    setSelectedSensor(profile);
    setThresholds(profile.defaultThresholds);
    setReadings([]);
    setWarnings([]);
    setStatus('Normal');
    simulatorRef.current.setProfile(profile);
    simulatorRef.current.setScenario('normal');
    setActiveScenario('normal');
  };

  // Handle scenario switch
  const handleSelectScenario = (scenario: TestScenario) => {
    setActiveScenario(scenario);
    simulatorRef.current.setScenario(scenario);
  };

  // Handle threshold updates
  const handleUpdateThresholds = (newThresholds: SensorThresholds) => {
    setThresholds(newThresholds);
  };

  // Clear single warning
  const handleClearWarning = (id: string) => {
    setWarnings(prev =>
      prev.map(w => (w.id === id ? { ...w, isCleared: true, clearedAt: Date.now() } : w))
    );
  };

  // Clear all warnings
  const handleClearAllWarnings = () => {
    setWarnings(prev => prev.map(w => ({ ...w, isCleared: true, clearedAt: Date.now() })));
  };

  // Main simulation loop (~1 second interval)
  useEffect(() => {
    const interval = setInterval(() => {
      const newReading = simulatorRef.current.getNextReading();

      setReadings(prev => {
        const updated = [...prev, newReading];
        // Keep last 60 readings (~60 seconds)
        if (updated.length > 60) updated.shift();

        // Run detection engine
        const detection = detectFaults(selectedSensor, thresholds, updated);
        setStatus(detection.status);

        // Merge warnings
        setWarnings(existing => {
          const existingMap = new Map(existing.map(e => [e.id, e]));
          let newToast: WarningItem | null = null;

          detection.warnings.forEach(dw => {
            if (!existingMap.has(dw.id)) {
              existingMap.set(dw.id, dw);
              newToast = dw;
            }
          });

          if (newToast) {
            startTransition(() => {
              setToastWarning(newToast);
            });
          }

          return Array.from(existingMap.values());
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSensor, thresholds]);

  const activeWarningsCount = warnings.filter(w => !w.isCleared).length;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col md:flex-row bg-[#0B1020] text-[#E6EAF2] ${isDarkMode ? '' : 'theme-light'}`}>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeWarningsCount={activeWarningsCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
          <TopBar
            selectedSensor={selectedSensor}
            status={status}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            activeScenario={activeScenario}
          />

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {activeTab === 'dashboard' && (
                <Dashboard
                  selectedSensor={selectedSensor}
                  readings={readings}
                  warnings={warnings}
                  status={status}
                  onClearWarning={handleClearWarning}
                  onNavigateDiagnostics={() => setActiveTab('diagnostics')}
                />
              )}

              {activeTab === 'select' && (
                <SensorSelect
                  selectedSensor={selectedSensor}
                  onSelectSensor={handleSelectSensor}
                  thresholds={thresholds}
                  onUpdateThresholds={handleUpdateThresholds}
                />
              )}

              {activeTab === 'diagnostics' && (
                <Diagnostics
                  warnings={warnings}
                  onClearWarning={handleClearWarning}
                  onClearAllWarnings={handleClearAllWarnings}
                />
              )}

              {activeTab === 'test' && (
                <TestMode
                  activeScenario={activeScenario}
                  onSelectScenario={handleSelectScenario}
                  warnings={warnings}
                />
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="py-4 px-8 border-t border-slate-800/80 text-center text-xs text-slate-500 bg-[#080C17]/50">
            SensorSure is a troubleshooting assistant. Warnings indicate possible issues, not confirmed faults. Built for ECE & IoT students.
          </footer>
        </div>

        {/* Toast Notification */}
        <Toast warning={toastWarning} onClose={() => setToastWarning(null)} />
      </div>
    </ErrorBoundary>
  );
}
