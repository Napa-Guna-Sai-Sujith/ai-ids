import React from 'react';
import { X, FileSpreadsheet, FileJson, Code2, HardDrive, FileText, Download, Database, ShieldCheck, Activity } from 'lucide-react';

interface DatasetFile {
  name: string;
  records: number;
  size: string;
  format: 'CSV' | 'JSON' | 'XML' | 'PCAP' | 'LOG' | 'ZIP';
  status: 'Active' | 'Processing' | 'Streaming' | 'Training AI';
  lastUpdated: string;
  recordsAnalyzed: number;
  detectionCount: number;
  accuracy: number;
}

interface DatasetViewerModalProps {
  file: DatasetFile | null;
  onClose: () => void;
}

const getSampleContentForFile = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower.includes('network') || lower.includes('csv')) {
    return {
      type: 'table',
      headers: ['Timestamp', 'Source IP', 'Dest IP', 'Protocol', 'Bytes', 'Packets', 'Status', 'Detection'],
      rows: [
        ['2026-08-31 21:00:01', '192.168.1.105', '10.0.0.1', 'TCP', '1,542,000', '12,500', 'ANALYZED', 'DDoS Flood'],
        ['2026-08-31 21:00:05', '185.220.101.45', '10.0.0.1', 'UDP', '2,100,500', '18,900', 'ANALYZED', 'DoS Attack'],
        ['2026-08-31 21:00:12', '10.0.0.55', '192.168.1.1', 'TCP', '45,200', '350', 'ANALYZED', 'Port Scan'],
        ['2026-08-31 21:00:18', '194.87.31.54', '192.168.1.50', 'HTTP', '3,450', '28', 'ANALYZED', 'Web Attack'],
        ['2026-08-31 21:00:25', '172.16.0.45', '10.0.0.1', 'UDP', '1,670,000', '13,800', 'ANALYZED', 'BENIGN Traffic'],
      ],
    };
  }

  if (lower.includes('json') || lower.includes('signatures')) {
    return {
      type: 'code',
      code: JSON.stringify(
        [
          {
            signature_id: 'SIG-2026-001',
            attack_name: 'DDoS SYN Flood Vector',
            severity: 'CRITICAL',
            pattern: 'SYN_PACKET_RATE > 5000/s AND ACK_RATIO < 0.05',
            mitigation_action: 'Drop Source Subnet',
          },
          {
            signature_id: 'SIG-2026-002',
            attack_name: 'SQL Injection Union Payload',
            severity: 'CRITICAL',
            pattern: '(?i)(UNION|SELECT|CHAR|CONCAT).*FROM',
            mitigation_action: 'WAF Rule 403 Forbidden',
          },
          {
            signature_id: 'SIG-2026-003',
            attack_name: 'Stealth Port Scan Sweep',
            severity: 'MEDIUM',
            pattern: 'UNIQUE_DEST_PORTS > 50 WITHIN 2s',
            mitigation_action: 'Throttle Connection Rate',
          },
        ],
        null,
        2
      ),
    };
  }

  if (lower.includes('pcap') || lower.includes('packet')) {
    return {
      type: 'table',
      headers: ['Frame', 'Time (s)', 'Source MAC', 'Destination MAC', 'Protocol', 'Length', 'Info Payload'],
      rows: [
        ['1', '0.000000', '00:1A:2B:3C:4D:5E', '00:11:22:33:44:55', 'TCP', '66', '58421 → 80 [SYN] Seq=0 Win=64240'],
        ['2', '0.000124', '00:11:22:33:44:55', '00:1A:2B:3C:4D:5E', 'TCP', '66', '80 → 58421 [SYN, ACK] Seq=0 Ack=1'],
        ['3', '0.000210', '00:1A:2B:3C:4D:5E', '00:11:22:33:44:55', 'TCP', '54', '58421 → 80 [ACK] Seq=1 Ack=1'],
        ['4', '0.001045', '00:1A:2B:3C:4D:5E', '00:11:22:33:44:55', 'HTTP', '458', 'GET /api/v1/auth HTTP/1.1'],
        ['5', '0.002130', '00:11:22:33:44:55', '00:1A:2B:3C:4D:5E', 'HTTP', '230', 'HTTP/1.1 200 OK (application/json)'],
      ],
    };
  }

  if (lower.includes('xml') || lower.includes('malware')) {
    return {
      type: 'code',
      code: `<?xml version="1.0" encoding="UTF-8"?>
<ThreatIndicators system="AI-IDS-v2">
  <Indicator id="IOC-9901" type="MD5_Hash" riskScore="98">
    <Value>e99a18c428cb38d5f260853678922e03</Value>
    <ThreatName>Ransomware.Cryptor.Payload</ThreatName>
    <Action>Quarantine File &amp; Terminate Process</Action>
  </Indicator>
  <Indicator id="IOC-9902" type="C2_Domain" riskScore="95">
    <Value>malicious-c2-botnet.net</Value>
    <ThreatName>Trojan.CommandAndControl</ThreatName>
    <Action>Block DNS Resolution</Action>
  </Indicator>
</ThreatIndicators>`,
    };
  }

  if (lower.includes('user') || lower.includes('behavior')) {
    return {
      type: 'table',
      headers: ['User ID', 'Login Time', 'IP Address', 'Geo Location', 'Failed Attempts', 'Risk Score', 'Anomaly State'],
      rows: [
        ['USR-8812', '2026-08-31 19:15:02', '192.168.1.100', 'Internal LAN', '0', '12', 'Normal Behavior'],
        ['USR-4401', '2026-08-31 19:22:18', '185.220.101.45', 'Frankfurt, DE', '7', '89', 'Credential Brute Probe'],
        ['USR-9923', '2026-08-31 19:30:45', '10.0.0.50', 'Internal LAN', '1', '25', 'Normal Behavior'],
        ['USR-1045', '2026-08-31 19:41:00', '91.121.87.34', 'Roubaix, FR', '12', '96', 'Impossible Travel Anomaly'],
      ],
    };
  }

  // Default log file representation
  return {
    type: 'code',
    code: `2026-08-31T21:40:01.124Z [FIREWALL_EVENT] ACTION=BLOCK SRC=185.220.101.45 DST=192.168.1.10 PROTO=TCP SPT=49200 DPT=80 FLAGS=SYN REASON="AI-IDS Rule Match: DDoS Threshold Exceeded"
2026-08-31T21:40:03.451Z [FIREWALL_EVENT] ACTION=ALLOW SRC=192.168.1.100 DST=10.0.0.1 PROTO=TCP SPT=51200 DPT=443 FLAGS=ACK REASON="Permitted Legitimate Traffic"
2026-08-31T21:40:07.892Z [FIREWALL_EVENT] ACTION=BLOCK SRC=91.121.87.34 DST=192.168.1.50 PROTO=HTTP SPT=38290 DPT=80 payload="GET /admin?id=1' OR '1'='1" REASON="WAF Web Attack Injection"`,
  };
};

const getFormatIcon = (format: string) => {
  switch (format) {
    case 'CSV': return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
    case 'JSON': return <FileJson className="w-5 h-5 text-yellow-400" />;
    case 'XML': return <Code2 className="w-5 h-5 text-purple-400" />;
    case 'PCAP': return <HardDrive className="w-5 h-5 text-green-400" />;
    case 'LOG': return <FileText className="w-5 h-5 text-orange-400" />;
    default: return <Database className="w-5 h-5 text-gray-400" />;
  }
};

export default function DatasetViewerModal({ file, onClose }: DatasetViewerModalProps) {
  if (!file) return null;

  const content = getSampleContentForFile(file.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              {getFormatIcon(file.format)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {file.name}
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {file.format}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Size: {file.size} • Records: {file.records.toLocaleString()} • Status: {file.status}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Metadata Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/40 border-b border-slate-800/60">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-[11px] text-slate-400 uppercase font-medium">Format</p>
            <p className="text-sm font-bold text-blue-400 font-mono mt-0.5">{file.format}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-[11px] text-slate-400 uppercase font-medium">Total Records</p>
            <p className="text-sm font-bold text-purple-400 font-mono mt-0.5">{file.records.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-[11px] text-slate-400 uppercase font-medium">AI Accuracy</p>
            <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{file.accuracy}%</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-[11px] text-slate-400 uppercase font-medium">File Size</p>
            <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{file.size}</p>
          </div>
        </div>

        {/* Dataset Content Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Dataset Data Preview & Structure</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
              Showing Sample Flow Records
            </span>
          </div>

          {content.type === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold">
                  <tr>
                    {content.headers?.map((h, i) => (
                      <th key={i} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {content.rows?.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{content.code}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dataset validated & compatible with AI Feature Extractor</span>
          </p>

          <div className="flex items-center gap-3">
            <a
              href={`/sample_datasets/${file.name}`}
              download={file.name}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Dataset</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
