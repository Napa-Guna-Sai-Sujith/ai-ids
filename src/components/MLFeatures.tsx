import { useState, useEffect } from 'react';
import { Brain, Zap, BarChart3, Layers, Activity, Cpu } from 'lucide-react';
import { realTimeService, RealTimeFlow, FlowFeatures } from '../services/realTimeData';

interface FeatureGroup {
  category: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: Array<{
    name: string;
    key: keyof FlowFeatures;
    importance: number;
    unit: string;
    description: string;
  }>;
}

const featureGroups: FeatureGroup[] = [
  {
    category: 'Time-Based Features',
    icon: <Activity className="w-5 h-5" />,
    color: 'blue',
    description: 'Flow duration and packet rate metrics',
    features: [
      { name: 'Flow Duration', key: 'flowDuration', importance: 95, unit: 'μs', description: 'Total flow duration in microseconds' },
      { name: 'Flow Bytes/sec', key: 'flowBytesPerSec', importance: 92, unit: 'B/s', description: 'Bytes transferred per second' },
      { name: 'Flow Packets/sec', key: 'flowPacketsPerSec', importance: 90, unit: 'p/s', description: 'Packets transferred per second' },
    ],
  },
  {
    category: 'Packet Count Features',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'purple',
    description: 'Forward and backward packet statistics',
    features: [
      { name: 'Total Fwd Packets', key: 'totalFwdPackets', importance: 88, unit: 'pkts', description: 'Total packets in forward direction' },
      { name: 'Total Bwd Packets', key: 'totalBwdPackets', importance: 85, unit: 'pkts', description: 'Total packets in backward direction' },
      { name: 'Total Length Fwd', key: 'totalLengthFwdPackets', importance: 87, unit: 'B', description: 'Total bytes in forward packets' },
      { name: 'Total Length Bwd', key: 'totalLengthBwdPackets', importance: 84, unit: 'B', description: 'Total bytes in backward packets' },
    ],
  },
  {
    category: 'Packet Length Features',
    icon: <Layers className="w-5 h-5" />,
    color: 'green',
    description: 'Statistical analysis of packet sizes',
    features: [
      { name: 'Fwd Packet Max', key: 'fwdPacketLengthMax', importance: 82, unit: 'B', description: 'Max packet length forward' },
      { name: 'Fwd Packet Min', key: 'fwdPacketLengthMin', importance: 78, unit: 'B', description: 'Min packet length forward' },
      { name: 'Fwd Packet Mean', key: 'fwdPacketLengthMean', importance: 86, unit: 'B', description: 'Mean packet length forward' },
      { name: 'Fwd Packet Std', key: 'fwdPacketLengthStd', importance: 80, unit: 'B', description: 'Std dev of packet length forward' },
      { name: 'Bwd Packet Max', key: 'bwdPacketLengthMax', importance: 81, unit: 'B', description: 'Max packet length backward' },
      { name: 'Bwd Packet Mean', key: 'bwdPacketLengthMean', importance: 83, unit: 'B', description: 'Mean packet length backward' },
    ],
  },
  {
    category: 'Inter-Arrival Time (IAT)',
    icon: <Zap className="w-5 h-5" />,
    color: 'yellow',
    description: 'Time between consecutive packets',
    features: [
      { name: 'Flow IAT Mean', key: 'flowIATMean', importance: 91, unit: 'μs', description: 'Mean inter-arrival time' },
      { name: 'Flow IAT Std', key: 'flowIATStd', importance: 79, unit: 'μs', description: 'Std dev of inter-arrival time' },
      { name: 'Flow IAT Max', key: 'flowIATMax', importance: 76, unit: 'μs', description: 'Max inter-arrival time' },
      { name: 'Flow IAT Min', key: 'flowIATMin', importance: 74, unit: 'μs', description: 'Min inter-arrival time' },
      { name: 'Fwd IAT Total', key: 'fwdIATTotal', importance: 77, unit: 'μs', description: 'Total fwd inter-arrival time' },
      { name: 'Bwd IAT Total', key: 'bwdIATTotal', importance: 75, unit: 'μs', description: 'Total bwd inter-arrival time' },
    ],
  },
  {
    category: 'TCP Flag Features',
    icon: <Cpu className="w-5 h-5" />,
    color: 'red',
    description: 'TCP control flag counts (critical for attack detection)',
    features: [
      { name: 'SYN Flag Count', key: 'synFlagCount', importance: 96, unit: '', description: 'SYN flags (key for SYN flood)' },
      { name: 'ACK Flag Count', key: 'ackFlagCount', importance: 88, unit: '', description: 'Acknowledgment flags' },
      { name: 'PSH Flag Count', key: 'pshFlagCount', importance: 82, unit: '', description: 'Push flags' },
      { name: 'FIN Flag Count', key: 'finFlagCount', importance: 80, unit: '', description: 'Finish flags' },
      { name: 'RST Flag Count', key: 'rstFlagCount', importance: 85, unit: '', description: 'Reset flags' },
      { name: 'URG Flag Count', key: 'urgFlagCount', importance: 73, unit: '', description: 'Urgent flags' },
    ],
  },
  {
    category: 'Header & Window Features',
    icon: <Brain className="w-5 h-5" />,
    color: 'indigo',
    description: 'Protocol header and TCP window statistics',
    features: [
      { name: 'Fwd Header Length', key: 'fwdHeaderLength', importance: 70, unit: 'B', description: 'Forward header bytes' },
      { name: 'Bwd Header Length', key: 'bwdHeaderLength', importance: 68, unit: 'B', description: 'Backward header bytes' },
      { name: 'Init Win Bytes Fwd', key: 'initWinBytesFwd', importance: 84, unit: 'B', description: 'Initial window size forward' },
      { name: 'Init Win Bytes Bwd', key: 'initWinBytesBwd', importance: 82, unit: 'B', description: 'Initial window size backward' },
      { name: 'Active Mean', key: 'activeMean', importance: 71, unit: 'μs', description: 'Mean active time before idle' },
      { name: 'Idle Mean', key: 'idleMean', importance: 72, unit: 'μs', description: 'Mean idle time before active' },
    ],
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-yellow-500' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', bar: 'bg-indigo-500' },
};

const formatValue = (val: number, unit: string): string => {
  if (val === undefined || val === null) return '—';
  if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M' + unit;
  if (val >= 1000) return (val / 1000).toFixed(2) + 'K' + unit;
  if (val < 1 && val > 0) return val.toFixed(3) + unit;
  return val.toFixed(0) + unit;
};

export default function MLFeatures() {
  const [latestFlow, setLatestFlow] = useState<RealTimeFlow | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [pulseFeature, setPulseFeature] = useState<string | null>(null);

  useEffect(() => {
    const unsub = realTimeService.subscribe((flow) => {
      setLatestFlow(flow);
      setPulseFeature(flow.flowId);
      setTimeout(() => setPulseFeature(null), 600);
    });
    return () => { unsub(); };
  }, []);

  const totalFeatures = featureGroups.reduce((sum, g) => sum + g.features.length, 0);
  const categories = ['All', ...featureGroups.map(g => g.category)];
  const visibleGroups = selectedCategory === 'All' 
    ? featureGroups 
    : featureGroups.filter(g => g.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-indigo-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">ML Features in Use</h2>
              <p className="text-gray-400 text-sm">Network flow features extracted and analyzed in real-time</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-400">{totalFeatures}</p>
              <p className="text-xs text-gray-400 uppercase">Total Features</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{featureGroups.length}</p>
              <p className="text-xs text-gray-400 uppercase">Categories</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <p className="text-3xl font-bold text-green-400">LIVE</p>
              </div>
              <p className="text-xs text-gray-400 uppercase">Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Flow Banner */}
      {latestFlow && (
        <div className={`rounded-xl p-5 border-2 transition-all duration-300 ${
          latestFlow.prediction.label === 'BENIGN'
            ? 'bg-green-500/10 border-green-500/40'
            : 'bg-red-500/10 border-red-500/40'
        } ${pulseFeature ? 'scale-[1.01]' : ''}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                latestFlow.prediction.label === 'BENIGN'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400 animate-pulse'
              }`}>
                {latestFlow.prediction.label === 'BENIGN' ? '✓ NORMAL' : '⚠ ' + latestFlow.prediction.label}
              </div>
              <div className="text-sm">
                <p className="text-gray-300 font-mono">{latestFlow.sourceIP}:{latestFlow.sourcePort} → {latestFlow.destIP}:{latestFlow.destPort}</p>
                <p className="text-gray-500 text-xs">Flow ID: {latestFlow.flowId} • Protocol: {latestFlow.protocol}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-400">Confidence</p>
                <p className="text-xl font-bold text-white">{latestFlow.prediction.confidence.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Model</p>
                <p className="text-sm font-semibold text-blue-400">{latestFlow.prediction.modelUsed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Inference</p>
                <p className="text-sm font-semibold text-yellow-400">{latestFlow.prediction.inferenceTime.toFixed(2)} ms</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feature Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleGroups.map((group) => {
          const colors = colorClasses[group.color];
          return (
            <div key={group.category} className={`${colors.bg} rounded-xl border ${colors.border} overflow-hidden`}>
              <div className={`p-4 border-b ${colors.border}`}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={colors.text}>{group.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{group.category}</h3>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {group.features.length} features
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{group.description}</p>
              </div>
              <div className="p-4 space-y-3">
                {group.features.map((feature) => {
                  const value = latestFlow?.features[feature.key];
                  return (
                    <div key={feature.name} className="bg-gray-900/40 rounded-lg p-3 hover:bg-gray-900/60 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{feature.name}</p>
                          <p className="text-gray-500 text-xs truncate">{feature.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-mono font-bold ${colors.text} ${pulseFeature ? 'animate-pulse' : ''}`}>
                            {value !== undefined ? formatValue(value, feature.unit) : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${feature.importance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-mono w-10 text-right">{feature.importance}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Pipeline */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Model Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: '1. Capture', desc: 'Raw network packets', color: 'blue' },
            { step: '2. Extract', desc: '78+ flow features', color: 'purple' },
            { step: '3. Normalize', desc: 'StandardScaler', color: 'indigo' },
            { step: '4. Predict', desc: 'Ensemble ML', color: 'green' },
            { step: '5. Classify', desc: '7 attack classes', color: 'red' },
          ].map((stage, i) => {
            const c = colorClasses[stage.color];
            return (
              <div key={i} className={`${c.bg} ${c.border} border rounded-lg p-3 text-center`}>
                <p className={`text-xs ${c.text} font-bold uppercase`}>{stage.step}</p>
                <p className="text-white text-sm mt-1">{stage.desc}</p>
                <div className="mt-2 flex justify-center gap-1">
                  {[0, 1, 2].map(j => (
                    <div
                      key={j}
                      className={`w-1 h-1 rounded-full ${c.bar}`}
                      style={{ animation: `pulse 1.5s ${j * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
