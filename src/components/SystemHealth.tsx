import { useState, useEffect, useRef } from 'react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  component: string;
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy' },
    { name: 'Memory', value: 62, unit: '%', status: 'healthy' },
    { name: 'Disk I/O', value: 28, unit: '%', status: 'healthy' },
    { name: 'Network', value: 55, unit: '%', status: 'healthy' },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [uptime, setUptime] = useState(0);
  const [lastCheck, setLastCheck] = useState(new Date());

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate uptime
    const startTime = Date.now() - 86400000 * 3 + Math.random() * 43200000; // 2-4 days ago
    setUptime(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messages = [
      { level: 'info' as const, message: 'System health check completed', component: 'Monitor' },
      { level: 'success' as const, message: 'All services operational', component: 'Health' },
      { level: 'info' as const, message: 'Database connection pool optimized', component: 'Database' },
      { level: 'warning' as const, message: 'High memory usage detected temporarily', component: 'Memory' },
      { level: 'info' as const, message: 'Cache cleared successfully', component: 'Cache' },
      { level: 'success' as const, message: 'Backup completed', component: 'Backup' },
      { level: 'info' as const, message: 'Security scan initiated', component: 'Security' },
      { level: 'info' as const, message: 'Log rotation completed', component: 'Logger' },
    ];

    const generateLog = (): LogEntry => ({
      timestamp: new Date(),
      level: messages[Math.floor(Math.random() * messages.length)].level,
      message: messages[Math.floor(Math.random() * messages.length)].message,
      component: messages[Math.floor(Math.random() * messages.length)].component,
    });

    // Initial logs
    const initialLogs = Array.from({ length: 15 }, generateLog);
    setLogs(initialLogs);

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        setLogs(prev => [...prev.slice(-49), generateLog()]);
        setLastCheck(new Date());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update metrics randomly
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.min(100, Math.max(0, metric.value + (Math.random() * 10 - 5))),
        status: metric.value > 85 ? 'critical' : metric.value > 70 ? 'warning' : 'healthy'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info': return 'i';
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '×';
      default: return '?';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          System Health
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-xs">Uptime</p>
            <p className="text-white font-mono text-sm">{formatUptime(uptime)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Last Check</p>
            <p className="text-white font-mono text-sm">{lastCheck.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Resource Usage</h4>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">{metric.name}</span>
                  <span className={`${getStatusColor(metric.status)} font-semibold text-sm`}>
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                </div>
                <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(metric.status)}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Status */}
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Service Status</h4>
          <div className="space-y-3">
            {[
              { name: 'IDS Engine', status: 'running', color: 'green' },
              { name: 'ML Model', status: 'running', color: 'green' },
              { name: 'Database', status: 'running', color: 'green' },
              { name: 'Log Collector', status: 'running', color: 'green' },
              { name: 'Alert System', status: 'running', color: 'green' },
              { name: 'API Gateway', status: 'running', color: 'green' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${service.color}-500 animate-pulse`}></div>
                  <span className="text-gray-300">{service.name}</span>
                </div>
                <span className={`text-${service.color}-400 text-sm font-semibold uppercase`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-gray-300 text-sm font-semibold">System Logs</h4>
          <span className="text-gray-500 text-xs">{logs.length} entries</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-3 py-1 border-b border-gray-800 last:border-0">
              <span className="text-gray-500 text-xs whitespace-nowrap">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-bold bg-gray-700 ${getLogColor(log.level)}`}>
                {getLogIcon(log.level)}
              </span>
              <span className={`flex-1 ${getLogColor(log.level)}`}>{log.message}</span>
              <span className="text-gray-500 text-xs">{log.component}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Run Diagnostics', icon: '🔍', color: 'blue' },
          { label: 'Clear Cache', icon: '🗑️', color: 'yellow' },
          { label: 'Restart Services', icon: '🔄', color: 'purple' },
          { label: 'Export Logs', icon: '📤', color: 'green' },
        ].map((action, index) => (
          <button
            key={index}
            className={`bg-gray-700/50 hover:bg-gray-700 rounded-lg p-3 transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white`}
          >
            <span>{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
