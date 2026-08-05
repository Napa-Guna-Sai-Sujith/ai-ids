import { useState, useEffect, useRef } from 'react';

interface ModelMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
}

interface PredictionData {
  timestamp: number;
  predictions: number;
  accuracy: number;
  latency: number;
}

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetric[]>([
    { name: 'Accuracy', value: 99.87, target: 99.95, unit: '%' },
    { name: 'Precision', value: 99.82, target: 99.90, unit: '%' },
    { name: 'Recall', value: 99.79, target: 99.88, unit: '%' },
    { name: 'F1 Score', value: 99.80, target: 99.89, unit: '' },
  ]);

  const [modelMetrics] = useState<ModelMetric[]>([
    { name: 'Training Samples', value: 3500000, target: 5000000, unit: 'samples' },
    { name: 'Features', value: 248, target: 300, unit: 'features' },
    { name: 'Epochs', value: 750, target: 1000, unit: 'epochs' },
    { name: 'Model Size', value: 8.2, target: 12, unit: 'GB' },
  ]);

  const [predictionHistory, setPredictionHistory] = useState<PredictionData[]>([]);
  const [modelHealth, setModelHealth] = useState(99);
  const [lastUpdate, setLastUpdate] = useState('Just now');

  const accuracyCanvasRef = useRef<HTMLCanvasElement>(null);
  const latencyCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let currentAccuracy = 99.87;
    let currentLatency = 12;

    const interval = setInterval(() => {
      // Simulate accuracy fluctuation with higher baseline
      currentAccuracy = Math.min(99.99, Math.max(99.5, currentAccuracy + (Math.random() * 0.2 - 0.1)));
      currentLatency = Math.min(100, Math.max(20, currentLatency + (Math.random() * 10 - 5)));

      setMetrics(prev => prev.map(m => {
        if (m.name === 'Accuracy') {
          return { ...m, value: currentAccuracy };
        }
        if (m.name === 'Precision') {
          return { ...m, value: Math.min(99.9, currentAccuracy - 0.5 + Math.random()) };
        }
        if (m.name === 'Recall') {
          return { ...m, value: Math.min(99.9, currentAccuracy - 1 + Math.random() * 0.5) };
        }
        if (m.name === 'F1 Score') {
          return { ...m, value: parseFloat((currentAccuracy * 0.98).toFixed(1)) };
        }
        return m;
      }));

      setModelHealth(prev => Math.min(100, Math.max(85, prev + (Math.random() * 3 - 1.5))));
      setLastUpdate('Just now');

      setPredictionHistory(prev => {
        const newHistory = [...prev, {
          timestamp: Date.now(),
          predictions: Math.floor(Math.random() * 1000) + 500,
          accuracy: currentAccuracy,
          latency: currentLatency
        }];
        return newHistory.slice(-30);
      });

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = accuracyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (predictionHistory.length < 2) return;

    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw accuracy line
    const accuracyPoints = predictionHistory.map((data, i) => ({
      x: padding + (i / (predictionHistory.length - 1)) * chartWidth,
      y: padding + chartHeight - ((data.accuracy - 90) / 10) * chartHeight
    }));

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(accuracyPoints[0].x, accuracyPoints[0].y);
    accuracyPoints.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();

    // Draw target line
    const targetY = padding + chartHeight - ((99 - 90) / 10) * chartHeight;
    ctx.strokeStyle = '#6B7280';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, targetY);
    ctx.lineTo(width - padding, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [predictionHistory]);

  useEffect(() => {
    const canvas = latencyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (predictionHistory.length < 2) return;

    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw latency line
    const latencyPoints = predictionHistory.map((data, i) => ({
      x: padding + (i / (predictionHistory.length - 1)) * chartWidth,
      y: padding + chartHeight - (data.latency / 100) * chartHeight
    }));

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(latencyPoints[0].x, latencyPoints[0].y);
    latencyPoints.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();

  }, [predictionHistory]);

  const getMetricColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 98) return 'text-green-400';
    if (percentage >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 98) return 'bg-green-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          AI Model Performance
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-sm">Model Active</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">{metric.name}</p>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${getMetricColor(metric.value, metric.target)}`}>
                {metric.value.toFixed(1)}{metric.unit}
              </p>
            </div>
            <div className="mt-2 bg-gray-600 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(metric.value, metric.target)}`}
                style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">Target: {metric.target}{metric.unit}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Accuracy Trend
          </h4>
          <canvas ref={accuracyCanvasRef} width={300} height={120} className="w-full bg-gray-900/50 rounded-lg" />
        </div>
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Inference Latency (ms)
          </h4>
          <canvas ref={latencyCanvasRef} width={300} height={120} className="w-full bg-gray-900/50 rounded-lg" />
        </div>
      </div>

      {/* Model Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">Model Configuration</h4>
          <div className="space-y-3">
            {modelMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{metric.name}</span>
                  <span className="text-white font-semibold">{metric.value.toLocaleString()} {metric.unit}</span>
                </div>
                <div className="bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Health */}
        <div>
          <h4 className="text-gray-300 text-sm font-semibold mb-3">System Health</h4>
          <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Model Health Score</span>
              <span className={`text-xl font-bold ${modelHealth >= 90 ? 'text-green-400' : modelHealth >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                {modelHealth.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-600 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${modelHealth >= 90 ? 'bg-green-500' : modelHealth >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${modelHealth}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last Update</span>
              <span className="text-white">{lastUpdate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Model Version</span>
              <span className="text-blue-400 font-mono">v2.4.1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Algorithm</span>
              <span className="text-purple-400">Random Forest + LSTM</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">GPU Utilization</span>
              <span className="text-green-400">78%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Memory Usage</span>
              <span className="text-yellow-400">4.2 GB / 8 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
