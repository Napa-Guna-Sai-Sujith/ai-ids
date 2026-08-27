import { useState, useEffect } from 'react';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  eventType: 'attack' | 'block' | 'alert' | 'scan';
  attackType?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  source?: string;
  description: string;
}

export default function AttackTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'attack' | 'block' | 'alert' | 'scan'>('all');

  useEffect(() => {
    const eventTypes: Array<TimelineEvent['eventType']> = ['attack', 'block', 'alert', 'scan'];
    const attackTypes = ['DDoS', 'DoS', 'Port Scan', 'Web Attack'];
    const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];

    const generateEvent = (): TimelineEvent => {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        eventType,
        attackType: eventType === 'attack' ? attackTypes[Math.floor(Math.random() * attackTypes.length)] : undefined,
        severity: eventType === 'attack' ? severities[Math.floor(Math.random() * severities.length)] : undefined,
        source: eventType === 'attack' || eventType === 'block' ? `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
        description: getEventDescription(eventType),
      };
    };

    const getEventDescription = (type: string): string => {
      switch (type) {
        case 'attack': return 'Malicious traffic detected and analyzed';
        case 'block': return 'Threat successfully blocked by firewall';
        case 'alert': return 'Security alert triggered for review';
        case 'scan': return 'Network scan completed';
        default: return 'System event recorded';
      }
    };

    // Initial events
    const initialEvents = Array.from({ length: 20 }, generateEvent);
    setEvents(initialEvents);

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const newEvent = generateEvent();
        setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.eventType === filter);

  const getEventColor = (eventType: string, severity?: string) => {
    if (eventType === 'attack') {
      switch (severity) {
        case 'critical': return 'border-l-red-500 bg-red-500/10';
        case 'high': return 'border-l-orange-500 bg-orange-500/10';
        case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
        case 'low': return 'border-l-green-500 bg-green-500/10';
      }
    }
    switch (eventType) {
      case 'block': return 'border-l-green-500 bg-green-500/10';
      case 'alert': return 'border-l-blue-500 bg-blue-500/10';
      case 'scan': return 'border-l-purple-500 bg-purple-500/10';
      default: return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'attack': return (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      case 'block': return (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'alert': return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
      case 'scan': return (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Attack Timeline
        </h3>
        <div className="flex gap-2">
          {(['all', 'attack', 'block', 'alert', 'scan'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredEvents.slice(0, 15).map((event) => (
          <div
            key={event.id}
            className={`border-l-4 rounded-r-lg p-4 ${getEventColor(event.eventType, event.severity)} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">
                    {event.attackType ? `${event.attackType} Attack` : event.eventType.toUpperCase()}
                  </span>
                  {event.severity && (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      event.severity === 'critical' ? 'bg-red-500 text-white' :
                      event.severity === 'high' ? 'bg-orange-500 text-white' :
                      event.severity === 'medium' ? 'bg-yellow-500 text-gray-900' :
                      'bg-green-500 text-white'
                    }`}>
                      {event.severity.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{event.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="font-mono">{event.timestamp.toLocaleTimeString()}</span>
                  {event.source && (
                    <span className="font-mono">Source: {event.source}</span>
                  )}
                  <span className="font-mono">ID: {event.id}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Showing {Math.min(15, filteredEvents.length)} of {filteredEvents.length} events</span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live Updates Active
          </span>
        </div>
      </div>
    </div>
  );
}
