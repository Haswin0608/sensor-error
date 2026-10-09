/**
 * Toast component for SensorSure
 * Top-right toast notification for new warnings or faults.
 */

import React, { useEffect } from 'react';
import { AlertTriangle, XCircle, X } from 'lucide-react';
import { WarningItem } from '../detector/rules';

interface ToastProps {
  warning: WarningItem | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ warning, onClose }) => {
  useEffect(() => {
    if (!warning) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [warning, onClose]);

  if (!warning) return null;

  const isFault = warning.severity === 'fault';

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-start gap-3 ${
          isFault
            ? 'bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40'
            : 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-900/40'
        }`}
      >
        <div className={`p-2 rounded-xl ${isFault ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {isFault ? <XCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-white truncate">{warning.rule}</span>
            <span className="text-xs opacity-75">{warning.sensorName}</span>
          </div>
          <p className="text-xs mt-1 opacity-90 line-clamp-2">{warning.explanation}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-lg transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
