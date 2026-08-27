import React, { useEffect, useRef, useState } from 'react';
import { AttackTypeName } from '../types';
import { useDetection } from '../context/DetectionContext';

interface DetectionEvent {
  id: string;
  timestamp: Date;
  attackType: AttackTypeName;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIP: string;
  destinationIP: string;
  confidence: number;
}

const getAttackColor = (attackType: AttackTypeName): string => {
  const colors: Record<AttackTypeName, string> = {
    'DDoS': '#ef4444',
    'DoS': '#f97316',
    'Port Scan': '#06b6d4',
    'Web Attack': '#ec4899',
  };
  return colors[attackType] || '#64748b';
};

export const DetectionHistory: React.FC = () => {
  const { isDetectionActive } = useDetection();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<DetectionEvent[]>([]);
  const [chartData, setChartData] = useState<number[]>(new Array(24).fill(0));
  const [selectedAttack, setSelectedAttack] = useState<DetectionEvent | null>(null);

  const attackTypes: AttackTypeName[] = ['DDoS', 'DoS', 'Port Scan', 'Web Attack'];

  // Generate random IP
  const generateIP = () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

  // Generate random detection event
  const generateDetection = (): DetectionEvent => {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const severities: DetectionEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
    const weights = [0.3, 0.35, 0.25, 0.1];
    const rand = Math.random();
    let cumulative = 0;
    let severity: DetectionEvent['severity'] = 'low';
    for (let i = 0; i < severities.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        severity = severities[i];
        break;
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      attackType,
      severity,
      sourceIP: generateIP(),
      destinationIP: generateIP(),
      confidence: 75 + Math.random() * 24,
    };
  };

  // Simulate incoming detections ONLY when isDetectionActive is true
  useEffect(() => {
    if (!isDetectionActive) {
      return;
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const newDetection = generateDetection();
        setDetections(prev => [newDetection, ...prev].slice(0, 50));
        
        // Update chart data
        setChartData(prev => {
          const updated = [...prev];
          updated[23] = (updated[23] || 0) + 1;
          return updated.slice(1).concat([updated[23] || 0]);
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isDetectionActive]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw chart line
    const maxVal = Math.max(...chartData, 1);
    const points = chartData.map((val, i) => ({
      x: padding + (chartWidth / 23) * i,
      y: padding + chartHeight - (val / maxVal) * chartHeight,
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw points
    points.forEach((p, i) => {
      if (chartData[i] > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < 24; i += 4) {
      ctx.fillText(`${i}h`, padding + (chartWidth / 23) * i, height - 15);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      ctx.fillText(`${Math.round(maxVal - (maxVal / 4) * i)}`, padding - 5, padding + (chartHeight / 4) * i + 4);
    }

  }, [chartData]);

  const getSeverityColor = (severity: DetectionEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getSeverityText = (severity: DetectionEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Detection History & Analytics
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">Total Detections: <span className="text-white font-bold">{detections.length}</span></span>
          <span className="text-slate-400">Last 24h: <span className="text-red-400 font-bold">{chartData.reduce((a, b) => a + b, 0)}</span></span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full rounded-lg"
        />
      </div>

      {/* Detection Log */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Live Detection Log
          </h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {detections.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-400 mb-1">
                🛡️
              </div>
              <p className="text-sm font-medium text-white">System in Standby Mode</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Turn ON a dataset switch in the <span className="text-blue-400 font-semibold">Data Sources</span> tab to begin live threat detection logging.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-800/50 sticky top-0">
                <tr className="text-xs text-slate-400 uppercase">
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Attack Type</th>
                  <th className="px-4 py-2 text-left">Severity</th>
                  <th className="px-4 py-2 text-left">Source IP</th>
                  <th className="px-4 py-2 text-left">Confidence</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {detections.map((detection) => (
                  <tr
                    key={detection.id}
                    className={`border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                      selectedAttack?.id === detection.id ? 'bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedAttack(detection)}
                  >
                    <td className="px-4 py-2 text-xs text-slate-400 font-mono">
                      {detection.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${getAttackColor(detection.attackType)}20`,
                          color: getAttackColor(detection.attackType),
                        }}
                      >
                        {detection.attackType}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(detection.severity)}/20 ${getSeverityText(detection.severity)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(detection.severity)}`}></span>
                        {detection.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-400 font-mono">
                      {detection.sourceIP}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                            style={{ width: `${detection.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{detection.confidence.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        BLOCKED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Attack Details */}
      {selectedAttack && (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Attack Details</h4>
            <button
              onClick={() => setSelectedAttack(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Attack Type:</span>
              <span className="ml-2 text-white font-medium">{selectedAttack.attackType}</span>
            </div>
            <div>
              <span className="text-slate-400">Severity:</span>
              <span className={`ml-2 ${getSeverityText(selectedAttack.severity)} font-medium`}>
                {selectedAttack.severity.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Source IP:</span>
              <span className="ml-2 text-white font-mono text-xs">{selectedAttack.sourceIP}</span>
            </div>
            <div>
              <span className="text-slate-400">Destination IP:</span>
              <span className="ml-2 text-white font-mono text-xs">{selectedAttack.destinationIP}</span>
            </div>
            <div>
              <span className="text-slate-400">Confidence:</span>
              <span className="ml-2 text-green-400 font-medium">{selectedAttack.confidence.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-slate-400">Timestamp:</span>
              <span className="ml-2 text-white font-mono text-xs">{selectedAttack.timestamp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
