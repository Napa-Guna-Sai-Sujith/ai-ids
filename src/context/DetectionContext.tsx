import { createContext, useContext, useState, ReactNode } from 'react';
import { AttackTypeName } from '../types';

export interface ThreatNotification {
  id: string;
  type: 'zero-day' | 'unauthorized-link';
  attackCategory: string;
  sourceIP: string;
  destinationIP?: string;
  confidence: number;
  severity: 'critical' | 'high';
  timestamp: Date;
  mitreAttackId?: string;
  mitreTactic?: string;
  aiRationale?: string;
}

interface DetectionContextType {
  activeSwitches: { [fileName: string]: boolean };
  activeFileNames: string[];
  isDetectionActive: boolean;
  activeAttackTypes: AttackTypeName[];
  latestDetectedAttack: AttackTypeName | null;
  setLatestDetectedAttack: (attack: AttackTypeName | null) => void;
  toggleFileDetection: (fileName: string) => void;
  // Notification system
  notifications: ThreatNotification[];
  addNotification: (notif: ThreatNotification) => void;
  dismissNotification: (id: string) => void;
  // Pop-up details investigation modal state
  selectedThreatModal: ThreatNotification | null;
  setSelectedThreatModal: (threat: ThreatNotification | null) => void;
  highlightedDetectionId: string | null;
  setHighlightedDetectionId: (id: string | null) => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const getAttackTypesForFile = (fileName: string): AttackTypeName[] => {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('ddos')) return ['DDoS'];
  if (lowerName.includes('dos')) return ['DoS'];
  if (lowerName.includes('port')) return ['Port Scan'];
  if (lowerName.includes('web')) return ['Web Attack'];
  return ['DDoS', 'DoS', 'Port Scan', 'Web Attack'];
};

export const DetectionProvider = ({ children }: { children: ReactNode }) => {
  const [activeSwitches, setActiveSwitches] = useState<{ [fileName: string]: boolean }>({});
  const [latestDetectedAttack, setLatestDetectedAttack] = useState<AttackTypeName | null>(null);
  const [notifications, setNotifications] = useState<ThreatNotification[]>([]);
  const [selectedThreatModal, setSelectedThreatModal] = useState<ThreatNotification | null>(null);
  const [highlightedDetectionId, setHighlightedDetectionId] = useState<string | null>(null);

  const toggleFileDetection = (fileName: string) => {
    setActiveSwitches((prev) => {
      const isCurrentlyActive = !!prev[fileName];
      return { ...prev, [fileName]: !isCurrentlyActive };
    });
  };

  const addNotification = (notif: ThreatNotification) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 5)); // Max 5 visible at once
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const activeFileNames = Object.keys(activeSwitches).filter((name) => activeSwitches[name]);
  const isDetectionActive = activeFileNames.length > 0;

  // Determine which attack types are active based on the enabled files
  const activeAttackTypesSet = new Set<AttackTypeName>();
  activeFileNames.forEach((fileName) => {
    getAttackTypesForFile(fileName).forEach((type) => activeAttackTypesSet.add(type));
  });
  const activeAttackTypes = Array.from(activeAttackTypesSet);

  return (
    <DetectionContext.Provider
      value={{
        activeSwitches,
        activeFileNames,
        isDetectionActive,
        activeAttackTypes,
        latestDetectedAttack: isDetectionActive ? latestDetectedAttack : null,
        setLatestDetectedAttack,
        toggleFileDetection,
        notifications,
        addNotification,
        dismissNotification,
        selectedThreatModal,
        setSelectedThreatModal,
        highlightedDetectionId,
        setHighlightedDetectionId,
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
