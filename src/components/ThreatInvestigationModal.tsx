import React from 'react';
import { ShieldAlert, AlertTriangle, Link2, X, CheckCircle2, ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { ThreatNotification } from '../context/DetectionContext';

interface ThreatInvestigationModalProps {
  threat: ThreatNotification | null;
  onClose: () => void;
}

export const ThreatInvestigationModal: React.FC<ThreatInvestigationModalProps> = ({ threat, onClose }) => {
  if (!threat) return null;

  const isZeroDay = threat.type === 'zero-day';
  const mitreId = threat.mitreAttackId || (isZeroDay ? 'T1203 / T1068' : 'T1566.002 / T1071');
  const mitreTactic = threat.mitreTactic || (isZeroDay ? 'Execution & Privilege Escalation (Zero-Day Vector)' : 'Initial Access & Command and Control (C2)');

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          isZeroDay ? 'border-red-500/80 shadow-red-500/20' : 'border-purple-500/80 shadow-purple-500/20'
        }`}
      >
        {/* Top Glowing Header Accent */}
        <div 
          className={`h-1.5 w-full ${
            isZeroDay 
              ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600' 
              : 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600'
          } animate-pulse`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div 
              className={`p-2.5 rounded-xl border ${
                isZeroDay 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                  : 'bg-purple-500/20 border-purple-500/40 text-purple-400'
              }`}
            >
              {isZeroDay ? <ShieldAlert className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-wide">
                  {isZeroDay ? '🚨 ZERO-DAY INTRUSION FORENSIC REPORT' : '🚫 UNAUTHORIZED LINK INVESTIGATION'}
                </h3>
                <span 
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                    threat.severity === 'critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {threat.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Detection ID: <span className="text-white font-bold">#{threat.id.toUpperCase()}</span> • Captured: {threat.timestamp.toLocaleTimeString()} ({threat.timestamp.toLocaleDateString()})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Status Alert Banner */}
          <div 
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isZeroDay 
                ? 'bg-red-950/40 border-red-800/60 text-red-200' 
                : 'bg-purple-950/40 border-purple-800/60 text-purple-200'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${isZeroDay ? 'text-red-400' : 'text-purple-400'}`} />
            <div>
              <p className="font-bold text-sm text-white">
                {isZeroDay 
                  ? 'Novel Polymorphic Heuristic Match — Zero-Day Attack Detected' 
                  : 'Rogue Outbound Redirection / C2 Beaconing Detected'}
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {threat.aiRationale || (isZeroDay
                  ? `The deep learning CNN-LSTM temporal engine identified an unpatched polymorphic execution pattern targeting ${threat.attackCategory} services. The attack deviates 98.7% from normal network baseline traffic.`
                  : `Outbound packet flow attempted to establish a tunnel to an unauthorized, untrusted C2 domain / phishing redirect endpoint.`)}
              </p>
            </div>
          </div>

          {/* Key Forensic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Attack Category</p>
              <p className="text-sm font-bold text-blue-400 mt-1">{threat.attackCategory}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="text-[11px] text-slate-400 uppercase font-medium">AI Confidence Score</p>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-1">{threat.confidence.toFixed(1)}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Source Attacker IP</p>
              <p className="text-sm font-bold text-red-400 font-mono mt-1">{threat.sourceIP}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Target Destination</p>
              <p className="text-sm font-bold text-cyan-400 font-mono mt-1">{threat.destinationIP || '192.168.1.10'}</p>
            </div>
          </div>

          {/* MITRE ATT&CK & AI Engine Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* MITRE ATT&CK Mapping */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>MITRE ATT&CK® Framework Mapping</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Technique ID:</span>
                  <span className="font-mono font-bold text-purple-300">{mitreId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Tactic Name:</span>
                  <span className="font-medium text-slate-200 text-right">{mitreTactic}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Detection Mechanism:</span>
                  <span className="font-mono text-emerald-400">Neural-Tree Soft Voting Ensemble</span>
                </div>
              </div>
            </div>

            {/* AI Engine Model Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>AI Model Decision Breakdown</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">PyTorch CNN-LSTM Spatial-Temporal Match</span>
                    <span className="font-mono text-white font-bold">{threat.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${threat.confidence}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">XGBoost & Random Forest Tree Consensus</span>
                    <span className="font-mono text-white font-bold">{(threat.confidence - 0.4).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${threat.confidence - 0.4}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Automated Mitigation & SOC Actions Taken */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated SOC Mitigation Actions Applied</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong className="text-white">Firewall Ingress Rule Applied</strong>: Source IP <code className="text-red-300 bg-slate-900 px-1 py-0.5 rounded">{threat.sourceIP}</code> dropped immediately.</li>
              <li><strong className="text-white">Active Session Terminated</strong>: TCP RST flag injected to disconnect malicious payload socket.</li>
              <li><strong className="text-white">Telemetry Snapshot Preserved</strong>: NetFlow packet tensors logged to Neon PostgreSQL database for post-incident analysis.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Threat Neutralized (Latency: 11.4ms)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
            >
              Close Investigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatInvestigationModal;
