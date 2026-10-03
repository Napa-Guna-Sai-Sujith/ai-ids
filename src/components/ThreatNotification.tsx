import { useEffect, useState } from 'react';
import { useDetection } from '../context/DetectionContext';
import ThreatInvestigationModal from './ThreatInvestigationModal';

export default function ThreatNotificationToast() {
  const { notifications, dismissNotification, selectedThreatModal, setSelectedThreatModal, setHighlightedDetectionId } = useDetection();
  const [visibleNotifs, setVisibleNotifs] = useState<string[]>([]);

  // Animate notifications in
  useEffect(() => {
    notifications.forEach((n) => {
      if (!visibleNotifs.includes(n.id)) {
        // Small delay for staggered animation
        setTimeout(() => {
          setVisibleNotifs((prev) => [...prev, n.id]);
        }, 50);
      }
    });
  }, [notifications]);

  // Auto-dismiss after 7 seconds
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    notifications.forEach((n) => {
      const timer = setTimeout(() => {
        handleDismiss(n.id);
      }, 7000);
      timers.push(timer);
    });
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setVisibleNotifs((prev) => prev.filter((nid) => nid !== id));
    setTimeout(() => {
      dismissNotification(id);
    }, 400); // Wait for exit animation
  };

  const handleCardClick = (notif: any) => {
    setSelectedThreatModal(notif);
    setHighlightedDetectionId(notif.id);
  };

  return (
    <>
      {/* Toast Notification Container */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {notifications.map((notif, index) => {
            const isVisible = visibleNotifs.includes(notif.id);
            const isZeroDay = notif.type === 'zero-day';

            return (
              <div
                key={notif.id}
                className={`pointer-events-auto transform transition-all duration-500 ease-out ${
                  isVisible
                    ? 'translate-x-0 opacity-100 scale-100'
                    : 'translate-x-full opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  onClick={() => handleCardClick(notif)}
                  className={`relative overflow-hidden rounded-xl border-2 shadow-2xl backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-transform ${
                    isZeroDay
                      ? 'bg-red-950/95 border-red-500/70 shadow-red-500/30 hover:border-red-400'
                      : 'bg-purple-950/95 border-purple-500/70 shadow-purple-500/30 hover:border-purple-400'
                  }`}
                >
                  {/* Animated top border glow */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      isZeroDay
                        ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500'
                    } animate-pulse`}
                  />

                  {/* Pulsing background effect */}
                  <div
                    className={`absolute inset-0 ${
                      isZeroDay ? 'bg-red-500/5' : 'bg-purple-500/5'
                    } animate-pulse`}
                  />

                  <div className="relative p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                            isZeroDay
                              ? 'bg-red-500/20 border border-red-500/40'
                              : 'bg-purple-500/20 border border-purple-500/40'
                          }`}
                        >
                          <span className="text-lg">{isZeroDay ? '⚠️' : '🔗'}</span>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-extrabold tracking-wide ${
                              isZeroDay ? 'text-red-300' : 'text-purple-300'
                            }`}
                          >
                            {isZeroDay ? '🚨 ZERO-DAY THREAT' : '🚫 UNAUTHORIZED LINK'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {notif.timestamp.toLocaleTimeString()} • AI-IDS v2.4.1
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(notif.id);
                        }}
                        className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                        title="Dismiss notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Details */}
                    <div
                      className={`rounded-lg p-3 mb-2 border ${
                        isZeroDay
                          ? 'bg-red-900/30 border-red-800/50'
                          : 'bg-purple-900/30 border-purple-800/50'
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Category</span>
                          <span
                            className={`font-bold ${isZeroDay ? 'text-red-300' : 'text-purple-300'}`}
                          >
                            {notif.attackCategory}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Severity</span>
                          <span
                            className={`font-bold uppercase ${
                              notif.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                            }`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                                notif.severity === 'critical'
                                  ? 'bg-red-400 animate-ping'
                                  : 'bg-orange-400'
                              }`}
                            />
                            {notif.severity}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Source IP</span>
                          <span className="text-white font-mono text-[11px]">{notif.sourceIP}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Confidence</span>
                          <span className="text-emerald-400 font-bold">
                            {notif.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Click Hint */}
                    <div className="mb-2 text-center">
                      <span className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center justify-center gap-1">
                        🔍 Click to view Deep Forensic Report & Log
                      </span>
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          isZeroDay
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        AUTO-BLOCKED BY AI ENGINE
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{notif.id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar for auto-dismiss */}
                  <div className="h-0.5 bg-slate-800">
                    <div
                      className={`h-full ${
                        isZeroDay
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{
                        animation: 'shrink 7s linear forwards',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forensic Threat Details Modal */}
      <ThreatInvestigationModal
        threat={selectedThreatModal}
        onClose={() => setSelectedThreatModal(null)}
      />

      {/* CSS Animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}
