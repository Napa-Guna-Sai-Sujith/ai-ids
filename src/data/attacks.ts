import { AttackType } from '../types';

const attackData: AttackType[] = [
  {
    id: 'ddos',
    name: 'DDoS',
    fullName: 'Distributed Denial of Service',
    description: 'Multiple compromised systems flood a target with overwhelming traffic, making it unavailable to legitimate users.',
    severity: 'critical',
  },
  {
    id: 'dos',
    name: 'DoS',
    fullName: 'Denial of Service',
    description: 'A single system overwhelms a target with excessive requests, exhausting its resources and blocking legitimate access.',
    severity: 'high',
  },
  {
    id: 'port-scan',
    name: 'Port Scan',
    fullName: 'Port Scan',
    description: 'Systematic probing of network ports to discover open services, vulnerabilities, and potential entry points.',
    severity: 'medium',
  },
  {
    id: 'web-attack',
    name: 'Web Attack',
    fullName: 'Web Attacks',
    description: 'Exploitation of web application vulnerabilities including SQL injection, XSS, and other OWASP Top 10 threats.',
    severity: 'critical',
  },
];

export default attackData;
