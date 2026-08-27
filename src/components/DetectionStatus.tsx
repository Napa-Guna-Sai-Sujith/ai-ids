import { useState, useEffect } from 'react';
import { DetectionState } from '../types';
import { useDetection } from '../context/DetectionContext';

export default function DetectionStatus() {
  const { isDetectionActive, activeFileNames } = useDetection();

  const [state, setState] = useState<DetectionState>({
    isNormal: true,
    lastScan: 'STANDBY (No Data Source Active)',
    threatsBlocked: 0,
    activeConnections: 0,
  });

  const [flashAttack, setFlashAttack] = useState(false);

  useEffect(() => {
    if (!isDetectionActive) {
      setState((prev) => ({
        ...prev,
        isNormal: true,
        lastScan: 'IDLE (Turn ON a Data Source)',
        activeConnections: 0,
        threatsBlocked: 0,
      }));
      return;
    }

    const interval = setInterval(() => {
      const isNormal = Math.random() > 0.3;
      setState((prev) => ({
        isNormal,
        lastScan: new Date().toLocaleTimeString(),
        threatsBlocked: isNormal ? prev.threatsBlocked : prev.threatsBlocked + 1,
        activeConnections: Math.floor(Math.random() * 50) + 60,
      }));
      if (!isNormal) {
        setFlashAttack(true);
        setTimeout(() => setFlashAttack(false), 1500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isDetectionActive]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-500 rounded-full" />
        <h2 className="text-2xl font-bold text-white">Detection Status</h2>
        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
          LAST SCAN: {state.lastScan}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Normal Traffic Status */}
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-700 ${
            state.isNormal
              ? 'border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/20'
              : 'border-slate-700 bg-slate-800/50 opacity-50'
          } p-6`}
        >
          {state.isNormal && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-green-400/10 to-green-500/5 animate-gradient" />
            </div>
          )}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    state.isNormal ? 'bg-green-400 animate-pulse-green' : 'bg-slate-600'
                  }`}
                />
                <h3 className="text-lg font-semibold text-white">Normal Traffic</h3>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  state.isNormal
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {state.isNormal ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Active Connections</p>
                <p className="text-2xl font-mono font-bold text-white">{state.activeConnections}</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Packets/sec</p>
                <p className="text-2xl font-mono font-bold text-white">
                  {Math.floor(state.activeConnections * 127)}
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(state.activeConnections + 10, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Traffic Load: {Math.min(state.activeConnections + 10, 100)}%</p>
          </div>
        </div>

        {/* Attack Detected Status */}
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-700 ${
            !state.isNormal
              ? flashAttack
                ? 'border-red-500 bg-red-500/15 shadow-lg shadow-red-500/30 animate-pulse-red'
                : 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20'
              : 'border-slate-700 bg-slate-800/50 opacity-50'
          } p-6`}
        >
          {!state.isNormal && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-400/10 to-red-500/5 animate-gradient" />
              <div className="absolute w-full h-px bg-red-500/30 animate-scan-line" />
            </div>
          )}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    !state.isNormal ? 'bg-red-400 animate-pulse-red' : 'bg-slate-600'
                  }`}
                />
                <h3 className="text-lg font-semibold text-white">Attack Detected</h3>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  !state.isNormal
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {!state.isNormal ? 'ALERT' : 'CLEAN'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Threats Blocked</p>
                <p className="text-2xl font-mono font-bold text-red-400">{state.threatsBlocked.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <p className="text-2xl font-mono font-bold text-white">
                  {!state.isNormal ? `${(92 + Math.random() * 7).toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  !state.isNormal
                    ? 'bg-gradient-to-r from-red-600 to-red-400'
                    : 'bg-slate-700'
                }`}
                style={{ width: !state.isNormal ? `${60 + Math.random() * 35}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {!state.isNormal ? 'Threat Level: ELEVATED' : 'No active threats'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Scans', value: '24.8K', color: 'text-blue-400' },
          { label: 'Accuracy', value: '99.2%', color: 'text-green-400' },
          { label: 'Avg Response', value: '12ms', color: 'text-yellow-400' },
          { label: 'Model Version', value: 'v3.2.1', color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
