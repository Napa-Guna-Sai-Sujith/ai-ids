import { useState, useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  type: 'normal' | 'suspicious' | 'attack';
}

export default function TrafficVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [stats, setStats] = useState({ normal: 0, suspicious: 0, attack: 0 });

  const animate = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    let particles: Particle[] = [];
    let nextId = 0;

    const colors = {
      normal: ['#3b82f6', '#60a5fa', '#93c5fd'],
      suspicious: ['#f59e0b', '#fbbf24', '#fcd34d'],
      attack: ['#ef4444', '#f87171', '#fca5a5'],
    };

    function spawnParticle(): Particle {
      const rand = Math.random();
      const type: Particle['type'] = rand < 0.65 ? 'normal' : rand < 0.9 ? 'suspicious' : 'attack';
      const colorOptions = colors[type];
      return {
        id: nextId++,
        x: -10,
        y: Math.random() * canvas.offsetHeight,
        speed: 1 + Math.random() * 3,
        size: 2 + Math.random() * 3,
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        type,
      };
    }

    function frame() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      if (particles.length < 80) {
        for (let i = 0; i < 3; i++) particles.push(spawnParticle());
      }

      // Grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.15)';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < w; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      particles = particles.filter((p) => p.x < w + 20);

      particles.forEach((p) => {
        p.x += p.speed;
        p.y += Math.sin(p.x * 0.02) * 0.5;

        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(p.x - p.speed * 4, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      setStats({
        normal: particles.filter((p) => p.type === 'normal').length,
        suspicious: particles.filter((p) => p.type === 'suspicious').length,
        attack: particles.filter((p) => p.type === 'attack').length,
      });

      animRef.current = requestAnimationFrame(frame);
    }

    frame();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const handleResize = () => {
      const dpr2 = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr2;
      canvas.height = canvas.offsetHeight * dpr2;
      ctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
    };
    window.addEventListener('resize', handleResize);

    animate(canvas, ctx);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-indigo-500 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Network Traffic Monitor</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-mono">LIVE</span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/80">
        <canvas
          ref={canvasRef}
          className="w-full h-48 md:h-64"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        />

        {/* Overlay stats */}
        <div className="absolute top-3 right-3 flex gap-3">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-blue-400 uppercase">Normal</p>
            <p className="text-sm font-mono font-bold text-blue-300">{stats.normal}</p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-yellow-400 uppercase">Suspicious</p>
            <p className="text-sm font-mono font-bold text-yellow-300">{stats.suspicious}</p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 py-1.5 text-center">
            <p className="text-[10px] text-red-400 uppercase">Attack</p>
            <p className="text-sm font-mono font-bold text-red-300">{stats.attack}</p>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-3 left-3 flex gap-4 text-[10px] text-slate-500 font-mono">
          <span>PARTICLE: {stats.normal + stats.suspicious + stats.attack}</span>
          <span>RENDER: CANVAS 2D</span>
          <span>TRACE: ACTIVE</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Normal Traffic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Suspicious Activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Attack Pattern</span>
        </div>
      </div>
    </div>
  );
}
