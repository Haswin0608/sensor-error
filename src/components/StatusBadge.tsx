/**
 * StatusBadge component for SensorSure
 * Displays Normal, Warning, or Fault with distinct color, icon, and glow animation.
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Normal' | 'Warning' | 'Fault';
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showGlow = true
}) => {
  const configs = {
    Normal: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      icon: CheckCircle2,
      label: 'Normal'
    },
    Warning: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      icon: AlertTriangle,
      label: 'Warning'
    },
    Fault: {
      bg: 'bg-red-500/10 text-red-400 border-red-500/30',
      dot: 'bg-red-400 animate-ping',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
      icon: XCircle,
      label: 'Fault Detected'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    md: 'px-3.5 py-1.5 text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-2xl font-semibold'
  };

  return (
    <div
      className={`inline-flex items-center border backdrop-blur-md transition-all duration-300 ${config.bg} ${sizeClasses[size]} ${
        showGlow ? config.glow : ''
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </div>
  );
};
