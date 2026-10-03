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

  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Uptime counter — increments every second
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Metric updater — simulates live metric fluctuation every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev =>
        prev.map(m => {
          const delta = (Math.random() - 0.5) * 6;
          const newVal = Math.max(10, Math.min(95, m.value + delta));
          const status: SystemMetric['status'] =
            newVal > 85 ? 'critical' : newVal > 70 ? 'warning' : 'healthy';
          return { ...m, value: newVal, status };
        })
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Automatic log generator — adds a system log entry every 8 seconds
  useEffect(() => {
    const logMessages: Array<{ level: LogEntry['level']; message: string; component: string }> = [
      { level: 'info', message: 'Packet inspection engine processed 12,847 flows', component: 'IDS Engine' },
      { level: 'info', message: 'ML model inference pipeline healthy — latency 11.4ms', component: 'ML Model' },
      { level: 'success', message: 'Threat signature database synchronized (v2024.10.01)', component: 'Database' },
      { level: 'info', message: 'WebSocket connections: 3 active, 0 pending', component: 'API Gateway' },
      { level: 'success', message: 'Automated backup checkpoint created successfully', component: 'System' },
      { level: 'info', message: 'Network traffic analysis: 2.4 GB processed in last 60s', component: 'Network' },
      { level: 'warning', message: 'Elevated packet rate detected on port 443 — monitoring', component: 'IDS Engine' },
      { level: 'info', message: 'Feature extraction pipeline: 248 features computed per flow', component: 'ML Model' },
      { level: 'success', message: 'SSL/TLS certificate validation passed for all endpoints', component: 'Security' },
      { level: 'info', message: 'Log rotation completed — archived 847 entries', component: 'Log Collector' },
      { level: 'info', message: 'Anomaly detection threshold recalibrated via adaptive learning', component: 'ML Model' },
      { level: 'success', message: 'Zero false positives in last 500 inspected flows', component: 'IDS Engine' },
    ];

    const timer = setInterval(() => {
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [...prev, { ...msg, timestamp: new Date() }].slice(-100));
      setLastCheck(new Date());
    }, 8000);
    return () => clearInterval(timer);
  }, []);

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

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleRunDiagnostics = () => {
    setActiveAction('diagnostics');
    setActionMessage('Running comprehensive AI system diagnostics...');
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date(),
          level: 'success',
          message: 'System diagnostics complete: All 6 microservices operational (0 errors, 100% health rating)',
          component: 'Diagnostics',
        },
      ]);
      setMetrics(prev =>
        prev.map(m =>
          m.name === 'CPU Usage' ? { ...m, value: 35.0, status: 'healthy' } :
          m.name === 'Memory' ? { ...m, value: 48.0, status: 'healthy' } : m
        )
      );
      setActionMessage('✓ Diagnostics Completed Successfully');
      setActiveAction(null);
      setTimeout(() => setActionMessage(null), 3500);
    }, 1200);
  };

  const handleClearCache = () => {
    setActiveAction('cache');
    setActionMessage('Clearing system cache and model memory buffers...');
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date(),
          level: 'success',
          message: 'Cache purge complete: 184 MB temporary memory buffers cleared',
          component: 'Cache',
        },
      ]);
      setMetrics(prev =>
        prev.map(m => (m.name === 'Memory' ? { ...m, value: Math.max(30, m.value - 18), status: 'healthy' } : m))
      );
      setActionMessage('✓ System Cache Cleared');
      setActiveAction(null);
      setTimeout(() => setActionMessage(null), 3500);
    }, 1000);
  };

  const handleRestartServices = () => {
    setActiveAction('restart');
    setActionMessage('Restarting IDS Security Microservices...');
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date(),
          level: 'warning',
          message: 'IDS Microservices graceful restart initiated',
          component: 'System',
        },
        {
          timestamp: new Date(),
          level: 'success',
          message: 'IDS Security Engine, Database pool & ML Services re-initialized',
          component: 'System',
        },
      ]);
      setLastCheck(new Date());
      setActionMessage('✓ Microservices Restarted Successfully');
      setActiveAction(null);
      setTimeout(() => setActionMessage(null), 3500);
    }, 1500);
  };

  const handleExportLogs = () => {
    setActiveAction('export');
    const logText = logs
      .map(
        l =>
          `[${l.timestamp.toISOString()}] [${l.level.toUpperCase()}] [${l.component}] ${l.message}`
      )
      .join('\n');

    const blob = new Blob([`==================================================\nAI INTRUSION DETECTION SYSTEM — HEALTH LOGS EXPORT\n==================================================\n\n${logText}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ids_health_logs_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setLogs(prev => [
      ...prev,
      {
        timestamp: new Date(),
        level: 'info',
        message: `Exported ${logs.length} log entries to file ids_health_logs.log`,
        component: 'Exporter',
      },
    ]);
    setActionMessage('✓ System Health Logs Exported (.log)');
    setActiveAction(null);
    setTimeout(() => setActionMessage(null), 3500);
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

      {actionMessage && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>{actionMessage}</span>
        </div>
      )}

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
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-300">{service.name}</span>
                </div>
                <span className="text-green-400 text-sm font-semibold uppercase">
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
        <div ref={logsContainerRef} className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={handleRunDiagnostics}
          disabled={activeAction !== null}
          className="bg-gray-700/50 hover:bg-gray-700 border border-slate-600/50 hover:border-blue-500/50 rounded-lg p-3 transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white cursor-pointer active:scale-95"
        >
          <span>{activeAction === 'diagnostics' ? '⏳' : '🔍'}</span>
          <span className="text-sm font-medium">{activeAction === 'diagnostics' ? 'Scanning...' : 'Run Diagnostics'}</span>
        </button>

        <button
          type="button"
          onClick={handleClearCache}
          disabled={activeAction !== null}
          className="bg-gray-700/50 hover:bg-gray-700 border border-slate-600/50 hover:border-amber-500/50 rounded-lg p-3 transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white cursor-pointer active:scale-95"
        >
          <span>{activeAction === 'cache' ? '⏳' : '🗑️'}</span>
          <span className="text-sm font-medium">{activeAction === 'cache' ? 'Clearing...' : 'Clear Cache'}</span>
        </button>

        <button
          type="button"
          onClick={handleRestartServices}
          disabled={activeAction !== null}
          className="bg-gray-700/50 hover:bg-gray-700 border border-slate-600/50 hover:border-purple-500/50 rounded-lg p-3 transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white cursor-pointer active:scale-95"
        >
          <span>{activeAction === 'restart' ? '⏳' : '🔄'}</span>
          <span className="text-sm font-medium">{activeAction === 'restart' ? 'Restarting...' : 'Restart Services'}</span>
        </button>

        <button
          type="button"
          onClick={handleExportLogs}
          disabled={activeAction !== null}
          className="bg-gray-700/50 hover:bg-gray-700 border border-slate-600/50 hover:border-emerald-500/50 rounded-lg p-3 transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white cursor-pointer active:scale-95"
        >
          <span>{activeAction === 'export' ? '⏳' : '📤'}</span>
          <span className="text-sm font-medium">{activeAction === 'export' ? 'Exporting...' : 'Export Logs'}</span>
        </button>
      </div>
    </div>
  );
}
