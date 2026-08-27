import { createContext, useContext, useState, ReactNode } from 'react';

interface DetectionContextType {
  activeSwitches: { [fileName: string]: boolean };
  activeFileNames: string[];
  isDetectionActive: boolean;
  toggleFileDetection: (fileName: string) => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const DetectionProvider = ({ children }: { children: ReactNode }) => {
  const [activeSwitches, setActiveSwitches] = useState<{ [fileName: string]: boolean }>({});

  const toggleFileDetection = (fileName: string) => {
    setActiveSwitches((prev) => {
      const isCurrentlyActive = !!prev[fileName];
      return { ...prev, [fileName]: !isCurrentlyActive };
    });
  };

  const activeFileNames = Object.keys(activeSwitches).filter((name) => activeSwitches[name]);
  const isDetectionActive = activeFileNames.length > 0;

  return (
    <DetectionContext.Provider
      value={{
        activeSwitches,
        activeFileNames,
        isDetectionActive,
        toggleFileDetection,
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
