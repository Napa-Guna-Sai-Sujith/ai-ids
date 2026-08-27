import { useState, useEffect } from 'react';
import attackData from '../data/attacks';
import AttackCard from './AttackCard';
import { useDetection } from '../context/DetectionContext';

export default function AttackCards() {
  const { isDetectionActive } = useDetection();
  const [detectedAttacks, setDetectedAttacks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isDetectionActive) {
      setDetectedAttacks(new Set());
      return;
    }

    const interval = setInterval(() => {
      // Randomly toggle some attacks as detected
      const numDetected = Math.floor(Math.random() * 3) + 1;
      const newDetected = new Set<string>();
      const shuffled = [...attackData].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numDetected; i++) {
        newDetected.add(shuffled[i].id);
      }
      setDetectedAttacks(newDetected);
    }, 5000);
    return () => clearInterval(interval);
  }, [isDetectionActive]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-500 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Attack Type Detection</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-blink" />
          <span>Live Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {attackData.map((attack, index) => (
          <AttackCard
            key={attack.id}
            attack={attack}
            isDetected={detectedAttacks.has(attack.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
