import { useState, useEffect } from 'react';
import { useDetection } from '../context/DetectionContext';

interface Threat {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  destination: string;
  timestamp: Date;
  status: 'blocked' | 'pending' | 'investigating';
  confidence: number;
  description: string;
}

interface GeoData {
  country: string;
  code: string;
  attacks: number;
  color: string;
}

export default function ThreatIntel() {
  const { isDetectionActive, activeAttackTypes } = useDetection();
  const [threats, setThreats] = useState<Threat[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [geoData] = useState<GeoData[]>([
    { country: 'United States', code: 'US', attacks: 1245, color: '#3B82F6' },
    { country: 'China', code: 'CN', attacks: 892, color: '#EF4444' },
    { country: 'Russia', code: 'RU', attacks: 654, color: '#F97316' },
    { country: 'Germany', code: 'DE', attacks: 432, color: '#EAB308' },
    { country: 'Brazil', code: 'BR', attacks: 321, color: '#10B981' },
  ]);

  const [threatStats, setThreatStats] = useState({
    totalThreats: 0,
    blocked: 0,
    pending: 0,
    investigating: 0,
  });

  useEffect(() => {
    if (!isDetectionActive) {
      setThreats([]);
      setThreatStats({
        totalThreats: 0,
        blocked: 0,
        pending: 0,
        investigating: 0,
      });
      return;
    }

    const availableTypes = activeAttackTypes.length > 0 ? activeAttackTypes : ['DDoS'];
    const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    const statuses: Array<'blocked' | 'pending' | 'investigating'> = ['blocked', 'pending', 'investigating'];

    const generateThreat = (): Threat => {
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        severity: severities[Math.floor(Math.random() * severities.length)],
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destination: `192.168.1.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        confidence: Math.floor(Math.random() * 25) + 75,
        description: `Detected ${type} pattern from external source`,
      };
    };

    // Initial threats
    const initialThreats = Array.from({ length: 10 }, generateThreat);
    setThreats(initialThreats);

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const newThreat = generateThreat();
        setThreats(prev => [newThreat, ...prev.slice(0, 49)]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isDetectionActive]);

  useEffect(() => {
    setThreatStats({
      totalThreats: threats.length,
      blocked: threats.filter(t => t.status === 'blocked').length,
      pending: threats.filter(t => t.status === 'pending').length,
      investigating: threats.filter(t => t.status === 'investigating').length,
    });
  }, [threats]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-gray-900';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'investigating': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Threat Intelligence
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Threats</p>
          <p className="text-2xl font-bold text-white mt-1">{threatStats.totalThreats}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Blocked</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{threatStats.blocked}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{threatStats.pending}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Investigating</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{threatStats.investigating}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threats */}
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Recent Threats</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {threats.length === 0 ? (
              <div className="py-8 px-4 text-center bg-gray-700/20 rounded-xl border border-gray-700/40 text-gray-400">
                <p className="text-sm font-semibold text-white mb-1">Threat Intelligence Standby</p>
                <p className="text-xs">Turn ON a dataset switch in the <span className="text-blue-400 font-medium">Data Sources</span> tab to begin threat intelligence gathering.</p>
              </div>
            ) : (
              threats.slice(0, 10).map((threat) => (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className={`bg-gray-700/30 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-all ${
                    selectedThreat?.id === threat.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(threat.severity)}`}>
                        {threat.severity.toUpperCase()}
                      </span>
                      <span className="text-white font-medium">{threat.type}</span>
                    </div>
                    <span className={`text-sm ${getStatusColor(threat.status)}`}>{threat.status}</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    <p>From: {threat.source}</p>
                    <p>Time: {threat.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Threat Details */}
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Threat Details</h4>
          {selectedThreat ? (
            <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Threat ID</p>
                <p className="text-white font-mono">{selectedThreat.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Attack Type</p>
                <p className="text-white">{selectedThreat.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Severity</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedThreat.severity)}`}>
                  {selectedThreat.severity.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Source IP</p>
                <p className="text-white font-mono">{selectedThreat.source}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Destination IP</p>
                <p className="text-white font-mono">{selectedThreat.destination}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">AI Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${selectedThreat.confidence}%` }}
                    />
                  </div>
                  <span className="text-white">{selectedThreat.confidence}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className={`font-semibold ${getStatusColor(selectedThreat.status)}`}>
                  {selectedThreat.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-gray-300 text-sm">{selectedThreat.description}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Timestamp</p>
                <p className="text-white">{selectedThreat.timestamp.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-700/30 rounded-lg p-4 text-center text-gray-400">
              <p>Select a threat to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="mt-6">
        <h4 className="text-gray-300 text-sm font-semibold mb-3">Top Attack Sources (Geographic)</h4>
        <div className="space-y-2">
          {geoData.map((geo, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: geo.color }}
                />
                <span className="text-gray-300">{geo.country}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-32 bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(geo.attacks / 1500) * 100}%`, backgroundColor: geo.color }}
                  />
                </div>
                <span className="text-gray-400 text-xs sm:text-sm w-16 text-right font-mono">{(geo.attacks || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
