import { useState, useEffect, useRef } from 'react';
import { useDetection } from '../context/DetectionContext';

interface NetworkStat {
  label: string;
  value: string;
  change: number;
  unit: string;
}

interface PacketData {
  timestamp: number;
  packets: number;
  bytes: number;
  connections: number;
}

export default function NetworkStats() {
  const { isDetectionActive } = useDetection();
  const [stats, setStats] = useState<NetworkStat[]>([
    { label: 'Total Packets', value: '0', change: 0, unit: 'pkts' },
    { label: 'Throughput', value: '0.0', change: 0, unit: 'Mbps' },
    { label: 'Active Connections', value: '0', change: 0, unit: 'conn' },
    { label: 'Bandwidth Usage', value: '0.00', change: 0, unit: 'GB' },
  ]);

  const [packetHistory, setPacketHistory] = useState<PacketData[]>([]);
  const [topProtocols] = useState([
    { name: 'TCP', percentage: 45, color: '#3B82F6' },
    { name: 'UDP', percentage: 30, color: '#10B981' },
    { name: 'HTTP', percentage: 15, color: '#F59E0B' },
    { name: 'HTTPS', percentage: 10, color: '#EF4444' },
  ]);

  const [topSources] = useState([
    { ip: '192.168.1.100', packets: 15420, percentage: 25 },
    { ip: '192.168.1.101', packets: 12350, percentage: 20 },
    { ip: '10.0.0.50', packets: 9870, percentage: 16 },
    { ip: '172.16.0.25', packets: 7650, percentage: 12 },
    { ip: '192.168.1.102', packets: 5430, percentage: 9 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isDetectionActive) {
      setStats([
        { label: 'Total Packets', value: '0', change: 0, unit: 'pkts' },
        { label: 'Throughput', value: '0.0', change: 0, unit: 'Mbps' },
        { label: 'Active Connections', value: '0', change: 0, unit: 'conn' },
        { label: 'Bandwidth Usage', value: '0.00', change: 0, unit: 'GB' },
      ]);
      setPacketHistory([]);
      return;
    }

    let totalPackets = 1250000;
    let totalBytes = 45000000000;
    let activeConnections = 2340;
    let bandwidth = 125;

    const interval = setInterval(() => {
      const packetIncrease = Math.floor(Math.random() * 5000) + 1000;
      const byteIncrease = Math.floor(Math.random() * 50000000) + 10000000;
      const connChange = Math.floor(Math.random() * 100) - 30;

      totalPackets += packetIncrease;
      totalBytes += byteIncrease;
      activeConnections = Math.max(0, activeConnections + connChange);
      bandwidth = Math.min(1000, Math.max(10, bandwidth + (Math.random() * 50 - 25)));

      setStats([
        { label: 'Total Packets', value: totalPackets.toLocaleString(), change: packetIncrease, unit: 'pkts' },
        { label: 'Throughput', value: bandwidth.toFixed(1), change: parseFloat((Math.random() * 20 - 10).toFixed(1)), unit: 'Mbps' },
        { label: 'Active Connections', value: activeConnections.toString(), change: connChange, unit: 'conn' },
        { label: 'Bandwidth Usage', value: (totalBytes / 1000000000).toFixed(2), change: parseFloat((byteIncrease / 1000000000).toFixed(3)), unit: 'GB' },
      ]);

      setPacketHistory(prev => {
        const newHistory = [...prev, {
          timestamp: Date.now(),
          packets: packetIncrease,
          bytes: byteIncrease,
          connections: activeConnections
        }];
        return newHistory.slice(-50);
      });

      // Update top sources randomly
      if (Math.random() > 0.7) {
        setTopSources(prev => prev.map(source => ({
          ...source,
          packets: source.packets + Math.floor(Math.random() * 500),
          percentage: Math.max(5, Math.min(30, source.percentage + (Math.random() * 5 - 2.5)))
        })).sort((a, b) => b.packets - a.packets).slice(0, 5));
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [isDetectionActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (packetHistory.length < 2) return;

    const maxPackets = Math.max(...packetHistory.map(p => p.packets));
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw grid
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw line chart
    const points = packetHistory.map((data, i) => ({
      x: padding + (i / (packetHistory.length - 1)) * chartWidth,
      y: padding + chartHeight - (data.packets / maxPackets) * chartHeight
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();

    // Draw points
    points.forEach((point, i) => {
      if (i % 5 === 0 || i === points.length - 1) {
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [packetHistory]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Network Statistics
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.unit}</p>
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.change >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              <span>{Math.abs(stat.change).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Packet Flow Chart */}
      <div className="mb-6">
        <h4 className="text-gray-300 text-sm font-semibold mb-2">Packet Flow (Real-time)</h4>
        <canvas ref={canvasRef} width={600} height={150} className="w-full bg-gray-900/50 rounded-lg" />
      </div>

      {/* Protocol Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Protocol Distribution</h4>
          <div className="space-y-3">
            {topProtocols.map((protocol, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-gray-400 text-sm">{protocol.name}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${protocol.percentage}%`, backgroundColor: protocol.color }}
                  />
                </div>
                <div className="w-12 text-right text-gray-400 text-sm">{protocol.percentage.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Source IPs */}
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Top Source IPs</h4>
          <div className="space-y-2">
            {topSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-300 text-sm font-mono">{source.ip}</span>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-xs">{source.packets.toLocaleString()} pkts</div>
                  <div className="text-gray-500 text-xs">{source.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
