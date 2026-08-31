import { useState, useEffect, useRef } from 'react';
import { Database, Activity, ShieldCheck, Clock, FileSpreadsheet, FileJson, Code2, HardDrive, FileText, UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Archive, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDetection } from '../context/DetectionContext';
import { fetchUserDatasetsFromNeon, saveDatasetToNeonDirect } from '../services/neonDb';
import DatasetViewerModal from './DatasetViewerModal';

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

interface ActiveUsage {
  detectionId: string;
  dataSource: string;
  recordsAnalyzed: number;
  status: 'Analyzed' | 'Processing' | 'Matched';
  timestamp: string;
  attackType: string;
  confidence: number;
}

const MAX_FILE_SIZE_MB = 50;

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getFormatIcon = (format: string) => {
  switch (format) {
    case 'CSV': return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
    case 'JSON': return <FileJson className="w-5 h-5 text-yellow-400" />;
    case 'XML': return <Code2 className="w-5 h-5 text-purple-400" />;
    case 'PCAP': return <HardDrive className="w-5 h-5 text-green-400" />;
    case 'LOG': return <FileText className="w-5 h-5 text-orange-400" />;
    case 'ZIP': return <Archive className="w-5 h-5 text-indigo-400" />;
    default: return <Database className="w-5 h-5 text-gray-400" />;
  }
};

export default function DataSources() {
  const { user } = useAuth();
  const { activeSwitches, activeFileNames, toggleFileDetection } = useDetection();

  const [datasetFiles, setDatasetFiles] = useState<DatasetFile[]>(() => {
    const defaultFiles: DatasetFile[] = [
      { name: 'network_traffic_log.csv', records: 125000, size: '45.2 MB', format: 'CSV', status: 'Active', lastUpdated: '2 min ago', recordsAnalyzed: 124500, detectionCount: 1247, accuracy: 99.2 },
      { name: 'attack_signatures.json', records: 2500, size: '1.8 MB', format: 'JSON', status: 'Active', lastUpdated: '5 min ago', recordsAnalyzed: 2500, detectionCount: 892, accuracy: 99.8 },
      { name: 'packet_capture_2024.pcap', records: 890000, size: '2.1 GB', format: 'PCAP', status: 'Streaming', lastUpdated: 'Live', recordsAnalyzed: 845000, detectionCount: 3421, accuracy: 98.9 },
      { name: 'malware_indicators.xml', records: 15000, size: '850 KB', format: 'XML', status: 'Active', lastUpdated: '10 min ago', recordsAnalyzed: 15000, detectionCount: 567, accuracy: 99.5 },
      { name: 'user_behavior_log.csv', records: 450000, size: '128 MB', format: 'CSV', status: 'Active', lastUpdated: '1 min ago', recordsAnalyzed: 448000, detectionCount: 2103, accuracy: 99.1 },
      { name: 'firewall_events.log', records: 2100000, size: '560 MB', format: 'LOG', status: 'Streaming', lastUpdated: 'Live', recordsAnalyzed: 2050000, detectionCount: 4521, accuracy: 99.4 },
    ];
    try {
      const removed = JSON.parse(localStorage.getItem('removed_dataset_files') || '[]');
      return defaultFiles.filter(f => !removed.includes(f.name));
    } catch {
      return defaultFiles;
    }
  });

  const [activeUsage, setActiveUsage] = useState<ActiveUsage[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<DatasetFile | null>(null);

  // File Upload & AI Training States
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved datasets from Neon DB on mount
  useEffect(() => {
    if (!user?.email) return;
    fetchUserDatasetsFromNeon(user.email)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const removed = JSON.parse(localStorage.getItem('removed_dataset_files') || '[]');
          const dbDatasets: DatasetFile[] = data
            .filter((d: any) => !removed.includes(d.file_name))
            .map((d: any) => ({
              name: d.file_name,
              records: d.records || 10000,
              size: d.file_size,
              format: (d.format || 'CSV') as DatasetFile['format'],
              status: d.status || 'Active',
              lastUpdated: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent',
              recordsAnalyzed: d.records || 10000,
              detectionCount: Math.floor(Math.random() * 500) + 50,
              accuracy: 99.5,
            }));
          setDatasetFiles(prev => {
            const existingNames = new Set(prev.map(f => f.name));
            const newFiles = dbDatasets.filter(f => !existingNames.has(f.name));
            return [...prev, ...newFiles];
          });
        }
      })
      .catch(err => console.warn('Could not fetch DB datasets:', err));
  }, [user?.email]);

  const handleRemoveFile = (fileName: string) => {
    if (activeSwitches[fileName]) {
      toggleFileDetection(fileName);
    }
    setDatasetFiles(prev => prev.filter(file => file.name !== fileName));
    try {
      const removed = JSON.parse(localStorage.getItem('removed_dataset_files') || '[]');
      if (!removed.includes(fileName)) {
        localStorage.setItem('removed_dataset_files', JSON.stringify([...removed, fileName]));
      }
    } catch (err) {
      console.warn('Could not save removed file to localStorage', err);
    }
  };

  // Generate detections ONLY from files that have their switch turned ON
  useEffect(() => {
    if (activeFileNames.length === 0) return;

    const interval = setInterval(() => {
      // Select a random file ONLY from currently enabled switches
      const targetFileName = activeFileNames[Math.floor(Math.random() * activeFileNames.length)];
      const lowerName = targetFileName.toLowerCase();

      let detectedType = 'DDoS';
      if (lowerName.includes('ddos')) {
        detectedType = 'DDoS';
      } else if (lowerName.includes('dos')) {
        detectedType = 'DoS';
      } else if (lowerName.includes('port')) {
        detectedType = 'Port Scan';
      } else if (lowerName.includes('web')) {
        detectedType = 'Web Attack';
      } else {
        const attackTypes = ['DDoS', 'DoS', 'Port Scan', 'Web Attack'];
        detectedType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      }

      const newUsage: ActiveUsage = {
        detectionId: `DET-${Date.now().toString().slice(-6)}`,
        dataSource: targetFileName,
        recordsAnalyzed: Math.floor(Math.random() * 5000) + 100,
        status: Math.random() > 0.3 ? 'Analyzed' : 'Processing',
        timestamp: new Date().toLocaleTimeString(),
        attackType: detectedType,
        confidence: Math.floor(Math.random() * 10) + 90,
      };

      setActiveUsage(prev => [newUsage, ...prev].slice(0, 20));

      // Increment analyzed records & detection count for the target file
      setDatasetFiles(files =>
        files.map(f => {
          if (f.name === targetFileName) {
            const addedDetections = Math.random() > 0.4 ? 1 : 0;
            return {
              ...f,
              recordsAnalyzed: Math.min(f.records, f.recordsAnalyzed + newUsage.recordsAnalyzed),
              detectionCount: f.detectionCount + addedDetections,
              lastUpdated: 'Just now',
            };
          }
          return f;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [activeFileNames]);

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Validate size limit (up to 50MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`File "${file.name}" exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB (${fileSizeMB.toFixed(1)}MB).`);
      return;
    }

    // Determine format
    const ext = file.name.split('.').pop()?.toUpperCase() || 'CSV';
    let format: DatasetFile['format'] = 'CSV';
    if (['JSON', 'XML', 'PCAP', 'LOG', 'ZIP'].includes(ext)) {
      format = ext as DatasetFile['format'];
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate Uploading Progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(uploadInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(uploadInterval);
      setUploadProgress(100);
      setIsUploading(false);

      const estimatedRecords = Math.floor(fileSizeMB * 15000) || 5000;
      const formattedSize = fileSizeMB < 1 ? `${(file.size / 1024).toFixed(0)} KB` : `${fileSizeMB.toFixed(1)} MB`;

      const newDataset: DatasetFile = {
        name: file.name,
        records: estimatedRecords,
        size: formattedSize,
        format,
        status: 'Training AI',
        lastUpdated: 'Just now',
        recordsAnalyzed: 0,
        detectionCount: 0,
        accuracy: 99.4,
      };

      setDatasetFiles(prev => [newDataset, ...prev]);
      setUploadSuccess(`"${file.name}" uploaded successfully! AI auto-training started.`);
      setTrainingStatus(`Retraining AI Model on custom dataset "${file.name}"...`);

      // Persist to Neon DB if user is logged in
      if (user?.email) {
        saveDatasetToNeonDirect({
          user_email: user.email,
          file_name: file.name,
          file_size: formattedSize,
          format,
          records: estimatedRecords,
        });
      }

      // Simulate Automated AI Model Retraining
      setTimeout(() => {
        setDatasetFiles(prev =>
          prev.map(f => (f.name === file.name ? { ...f, status: 'Active', recordsAnalyzed: estimatedRecords } : f))
        );
        setTrainingStatus(null);
        setUploadSuccess(`AI model automatically updated and fine-tuned with ${file.name}!`);
      }, 5000);
    }, 1500);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const totalRecords = datasetFiles.reduce((sum, f) => sum + f.records, 0);
  const totalDetections = datasetFiles.reduce((sum, f) => sum + f.detectionCount, 0);
  const avgAccuracy = datasetFiles.reduce((sum, f) => sum + f.accuracy, 0) / datasetFiles.length;

  return (
    <div className="space-y-6">
      {/* Upload & Auto-Train Section */}
      <div className="bg-slate-800/80 dark:bg-gray-800/80 rounded-xl border border-slate-700/50 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-blue-500" />
              Upload Custom Dataset & Auto-Train AI
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Upload company dataset files (<span className="text-blue-400 font-medium">.zip, .csv, .pcap, .json, .log, .xml</span> up to <span className="text-amber-400 font-semibold">{MAX_FILE_SIZE_MB}MB</span>). The intrusion detection engine automatically retrains on your dataset.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Select Dataset File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.pcap,.xml,.log,.zip"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/60"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <Archive className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Drag & Drop company datasets here or <span className="text-blue-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-500">Supports ZIP archives, CSV, PCAP, JSON, XML log files (Max 50MB)</p>
          </div>
        </div>

        {/* Progress & Feedback Notifications */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Uploading dataset...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {trainingStatus && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-sm flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
            <span>{trainingStatus}</span>
          </div>
        )}

        {uploadSuccess && !trainingStatus && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Sample Datasets for Testing */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🧪</span> Sample Test CSV Datasets
              </h4>
              <p className="text-xs text-slate-400">Download single-attack test datasets to test detection upload capabilities for each of the 4 supported attack types:</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href="/sample_datasets/ddos_attack_dataset.csv"
              download="ddos_attack_dataset.csv"
              className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition-all group"
            >
              <span>💥 DDoS CSV</span>
              <span className="text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded text-red-200 group-hover:scale-105 transition-transform">Download ⬇️</span>
            </a>
            <a
              href="/sample_datasets/dos_attack_dataset.csv"
              download="dos_attack_dataset.csv"
              className="flex items-center justify-between p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 text-xs font-semibold transition-all group"
            >
              <span>🔥 DoS CSV</span>
              <span className="text-[10px] bg-orange-500/30 px-1.5 py-0.5 rounded text-orange-200 group-hover:scale-105 transition-transform">Download ⬇️</span>
            </a>
            <a
              href="/sample_datasets/port_scan_dataset.csv"
              download="port_scan_dataset.csv"
              className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all group"
            >
              <span>🔍 Port Scan CSV</span>
              <span className="text-[10px] bg-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-200 group-hover:scale-105 transition-transform">Download ⬇️</span>
            </a>
            <a
              href="/sample_datasets/web_attack_dataset.csv"
              download="web_attack_dataset.csv"
              className="flex items-center justify-between p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 text-pink-300 text-xs font-semibold transition-all group"
            >
              <span>🌐 Web Attack CSV</span>
              <span className="text-[10px] bg-pink-500/30 px-1.5 py-0.5 rounded text-pink-200 group-hover:scale-105 transition-transform">Download ⬇️</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Files</p>
              <p className="text-2xl font-bold text-white">{datasetFiles.length}</p>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-white">{formatNumber(totalRecords)}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Detections</p>
              <p className="text-2xl font-bold text-white">{formatNumber(totalDetections)}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Accuracy</p>
              <p className="text-2xl font-bold text-white">{avgAccuracy.toFixed(1)}%</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Dataset Files</h3>
          <p className="text-gray-400 text-sm">All data sources being analyzed by the AI model</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Detection Switch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Format</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Records</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Analyzed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Detections</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Accuracy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Updated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {datasetFiles.map((file, index) => {
                const isSwitchedOn = !!activeSwitches[file.name];
                return (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-700/30 transition-colors ${isSwitchedOn ? 'bg-blue-500/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div 
                        onClick={() => setPreviewFile(file)}
                        className="flex items-center gap-2 cursor-pointer group hover:text-blue-400 transition-colors"
                      >
                        {getFormatIcon(file.format)}
                        <span className="text-white font-medium group-hover:text-blue-400 underline-offset-4 group-hover:underline">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    {/* Interactive Detection Switch Button */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleFileDetection(file.name)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isSwitchedOn ? 'bg-blue-600' : 'bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Toggle Detection</span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isSwitchedOn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">{file.format}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatNumber(file.records)}</td>
                    <td className="px-4 py-3 text-gray-300">{file.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(file.recordsAnalyzed / file.records) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-sm">{formatNumber(file.recordsAnalyzed)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatNumber(file.detectionCount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${file.accuracy}%` }}
                          />
                        </div>
                        <span className="text-green-400 text-sm">{file.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max gap-1.5 ${
                        isSwitchedOn ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        file.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        file.status === 'Streaming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {isSwitchedOn && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
                        {isSwitchedOn ? 'Detecting' : file.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{file.lastUpdated}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          title={`View data inside ${file.name}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Data</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.name)}
                          title={`Remove ${file.name}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Live Detection Data Usage</h3>
          <p className="text-gray-400 text-sm">Real-time tracking of which data files are being used for each detection</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Detection ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Attack Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Records</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {activeUsage.map((usage, index) => (
                <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-blue-400 font-mono text-sm">{usage.detectionId}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      usage.attackType === 'DDoS' ? 'bg-red-500/20 text-red-400' :
                      usage.attackType === 'DoS' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {usage.attackType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{usage.dataSource}</td>
                  <td className="px-4 py-3 text-gray-300">{formatNumber(usage.recordsAnalyzed)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${usage.confidence >= 95 ? 'bg-green-500' : usage.confidence >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${usage.confidence}%` }}
                        />
                      </div>
                      <span className={`text-sm ${usage.confidence >= 95 ? 'text-green-400' : usage.confidence >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {usage.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      usage.status === 'Analyzed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400 animate-pulse'
                    }`}>
                      {usage.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm font-mono">{usage.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Content Preview Modal */}
      <DatasetViewerModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
