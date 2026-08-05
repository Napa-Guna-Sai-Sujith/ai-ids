export type AttackTypeName = 'DDoS' | 'DoS' | 'Brute Force' | 'Bot' | 'Port Scan' | 'Web Attack';

export interface AttackType {
  id: string;
  name: AttackTypeName;
  fullName: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DetectionState {
  isNormal: boolean;
  lastScan: string;
  threatsBlocked: number;
  activeConnections: number;
}

export interface FlowStep {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}
