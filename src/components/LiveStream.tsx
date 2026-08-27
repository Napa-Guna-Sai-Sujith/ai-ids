import { useState, useEffect, useRef } from 'react';
import { Radio, Wifi, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { realTimeService, RealTimeFlow, RealTimeStats } from '../services/realTimeData';
import { useDetection } from '../context/DetectionContext';

const attackColors: Record<string, string> = {
  BENIGN: 'text-green-400 bg-green-500/10 border-green-500/30',
  DDoS: 'text-red-400 bg-red-500/10 border-red-500/30',
  DoS: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'Brute Force': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Bot: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'Port Scan': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Web Attack': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
};

export default function LiveStream() {
  const { isDetectionActive } = useDetection();
  const [flows, setFlows] = useState<RealTimeFlow[]>([]);
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'attacks'>('all');
  const [selectedAttackType, setSelectedAttackType] = useState<string>('All');
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    if (!isDetectionActive) {
      setFlows([]);
      return;
    }

    const unsubFlow = realTimeService.subscribe((flow) => {
      if (pausedRef.current) return;
      setFlows(prev => [flow, ...prev].slice(0, 100)); // Increase buffer
    });
    const unsubStats = realTimeService.subscribeStats((s) => setStats(s));
    return () => { unsubFlow(); unsubStats(); };
  }, [isDetectionActive]);

  const visibleFlows = flows.filter(f => {
    const typeMatch = selectedAttackType === 'All' || f.prediction.label === selectedAttackType;
    const alertMatch = filter === 'all' || f.prediction.label !== 'BENIGN';
    return typeMatch && alertMatch;
  });

  const attackOptions = ['All', 'BENIGN', 'DDoS', 'DoS', 'Port Scan', 'Brute Force', 'Bot', 'Web Attack'];

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
    return bytes.toFixed(0) + ' B';
  };

  const formatUptime = (s: number): string => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard label="Total Flows" value={stats?.totalFlows.toLocaleString() || '0'} icon={<Radio />} color="blue" />
        <StatCard label="Attacks" value={stats?.attacksDetected.toLocaleString() || '0'} icon={<AlertTriangle />} color="red" pulse />
        <StatCard label="Benign" value={stats?.benignFlows.toLocaleString() || '0'} icon={<CheckCircle2 />} color="green" />
        <StatCard label="Throughput" value={formatBytes(stats?.totalBytes || 0)} icon={<Wifi />} color="purple" />
        <StatCard label="Avg Latency" value={`${stats?.averageLatency.toFixed(2) || '0'} ms`} icon={<Zap />} color="yellow" />
      </div>

      {/* System Live Bar */}
      <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
            </div>
            <span className="text-white font-semibold">Real-Time Stream Active</span>
            <span className="text-gray-400 text-sm">• Uptime: {stats ? formatUptime(stats.uptime) : '0s'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">CPU: <span className="text-blue-400 font-mono">{stats?.cpuUsage.toFixed(1)}%</span></span>
            <span className="text-gray-400">RAM: <span className="text-purple-400 font-mono">{stats?.memoryUsage.toFixed(1)}%</span></span>
            <span className="text-gray-400">Accuracy: <span className="text-green-400 font-mono">{stats?.modelAccuracy.toFixed(2)}%</span></span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Connection:</span>
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              Simulation Mode
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Real Backend:</span>
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-mono">
              Not Connected
            </span>
          </div>
          <div className="text-xs text-gray-500">
            <span>Attack Ratio: <span className="text-blue-400 font-mono">{(stats ? (stats.attacksDetected / Math.max(1, stats.totalFlows) * 100) : 0).toFixed(1)}%</span></span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">CPU Load</span>
              <span className="text-blue-400">{stats?.cpuUsage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats?.cpuUsage || 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Memory</span>
              <span className="text-purple-400">{stats?.memoryUsage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${stats?.memoryUsage || 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Model Health</span>
              <span className="text-green-400">{stats?.modelAccuracy.toFixed(2)}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${stats?.modelAccuracy || 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${paused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`}></div>
              <h3 className="text-white font-semibold">Live Network Flow Stream</h3>
            </div>
            <span className="text-xs text-gray-500">{visibleFlows.length} flows displayed</span>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Attack Filter:</span>
              <select
                value={selectedAttackType}
                onChange={(e) => setSelectedAttackType(e.target.value)}
                className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {attackOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setFilter(filter === 'all' ? 'attacks' : 'all')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === 'attacks'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {filter === 'attacks' ? '⚠ Attacks Only' : 'Show All'}
            </button>
            <button
              onClick={() => setPaused(!paused)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                paused
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-900/80 sticky top-0">
              <tr className="text-left">
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Time & Date</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Flow ID</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Source</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Destination</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Proto</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Packets</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Bytes</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Prediction</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Action/Status</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Confidence</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Model</th>
                <th className="px-3 py-2 text-xs text-gray-400 uppercase font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {visibleFlows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-gray-500">
                    {paused ? 'Stream paused. Click Resume to continue.' : 'Waiting for live data matching filters...'}
                  </td>
                </tr>
              ) : (
                visibleFlows.map((flow, i) => {
                  const isNew = i === 0;
                  const isAttack = flow.prediction.label !== 'BENIGN';
                  
                  // Packet Blocked state: Generally, attacks are blocked, benign are not blocked (allowed)
                  const isBlocked = isAttack;

                  return (
                    <tr
                      key={flow.flowId}
                      className={`border-t border-gray-700/40 hover:bg-gray-700/30 transition-colors ${
                        isNew ? 'animate-fadeInRow' : ''
                      } ${isAttack ? 'bg-red-500/5' : ''}`}
                    >
                      <td className="px-3 py-2 text-xs text-gray-400 font-mono flex flex-col">
                        <span>{new Date(flow.timestamp).toLocaleDateString()}</span>
                        <span className="text-gray-500">{new Date(flow.timestamp).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-blue-400 font-mono">{flow.flowId.slice(-8)}</td>
                      <td className="px-3 py-2 text-xs text-gray-300 font-mono">{flow.sourceIP}:{flow.sourcePort}</td>
                      <td className="px-3 py-2 text-xs text-gray-300 font-mono">{flow.destIP}:{flow.destPort}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">{flow.protocol}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-300 font-mono">
                        {flow.features.totalFwdPackets + flow.features.totalBwdPackets}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-300 font-mono">
                        {formatBytes(flow.features.totalLengthFwdPackets + flow.features.totalLengthBwdPackets)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 text-xs rounded border ${attackColors[flow.prediction.label]}`}>
                          {flow.prediction.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {isBlocked ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            ALLOWED
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                flow.prediction.confidence >= 95 ? 'bg-green-500' :
                                flow.prediction.confidence >= 90 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${flow.prediction.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-300 font-mono">{flow.prediction.confidence.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-purple-400 font-mono">{flow.prediction.modelUsed}</td>
                      <td className="px-3 py-2 text-xs text-yellow-400 font-mono">{flow.prediction.inferenceTime.toFixed(1)}ms</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; background-color: rgba(59, 130, 246, 0.15); transform: translateX(-8px); }
          to { opacity: 1; background-color: transparent; transform: translateX(0); }
        }
        .animate-fadeInRow { animation: fadeInRow 0.6s ease-out; }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, color, pulse }: { label: string; value: string; icon: React.ReactNode; color: string; pulse?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-3`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-gray-400 text-xs uppercase truncate">{label}</p>
          <p className={`text-xl font-bold ${colors[color].split(' ').pop()} mt-0.5 truncate`}>{value}</p>
        </div>
        <div className={`${pulse ? 'animate-pulse' : ''} flex-shrink-0`}>{icon}</div>
      </div>
    </div>
  );
}
