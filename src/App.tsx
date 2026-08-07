import { useState, useEffect } from 'react';
import FlowDiagram from './components/FlowDiagram';
import TrafficVisualizer from './components/TrafficVisualizer';
import DetectionStatus from './components/DetectionStatus';
import AttackCards from './components/AttackCards';
import { DetectionHistory } from './components/DetectionHistory';
import NetworkStats from './components/NetworkStats';
import ModelPerformance from './components/ModelPerformance';
import ThreatIntel from './components/ThreatIntel';
import SystemHealth from './components/SystemHealth';
import AttackTimeline from './components/AttackTimeline';
import DataSources from './components/DataSources';
import MLFeatures from './components/MLFeatures';
import LiveStream from './components/LiveStream';
import LoginPage from './components/LoginPage';
import UserProfileModal from './components/UserProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';

type DashboardTab = 'overview' | 'livestream' | 'features' | 'network' | 'model' | 'threats' | 'health' | 'timeline' | 'datasources';

function DashboardContent({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) {
    return <LoginPage />;
  }

  const tabs: Array<{ id: DashboardTab; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'livestream', label: 'Live Stream', icon: '📡' },
    { id: 'features', label: 'ML Features', icon: '🧠' },
    { id: 'network', label: 'Network Stats', icon: '🌐' },
    { id: 'model', label: 'AI Model', icon: '🤖' },
    { id: 'threats', label: 'Threat Intel', icon: '🛡️' },
    { id: 'health', label: 'System Health', icon: '💚' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
    { id: 'datasources', label: 'Data Sources', icon: '📁' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
        : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-900'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-400/20'
        }`} style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDark
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold flex items-center gap-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Intrusion Detection System Dashboard
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                AI-Powered Network Security Monitoring
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* User Profile Avatar & Info — Click to edit profile */}
              <button
                onClick={() => setIsProfileOpen(true)}
                title="Edit Profile"
                className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/80' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full ring-2 ring-blue-500/50" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold flex items-center gap-1">
                    {user.name}
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-normal">Edit ✏️</span>
                  </p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                </div>
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                Logout
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle light and dark mode"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'bg-gray-700/60 border-gray-600 text-yellow-300 hover:bg-gray-700 hover:text-yellow-200'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {isDark ? (
                  <>
                    <span className="text-base">☀️</span> Light Mode
                  </>
                ) : (
                  <>
                    <span className="text-base">🌙</span> Dark Mode
                  </>
                )}
              </button>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isDark ? 'bg-green-500/20' : 'bg-green-100 border border-green-200'
              }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  System Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`relative border-b transition-colors duration-300 ${
        isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/60 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? isDark
                      ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                      : 'text-blue-600 border-blue-600 bg-blue-50'
                    : isDark
                      ? 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <FlowDiagram />
            <DetectionStatus />
            <TrafficVisualizer />
            <AttackCards />
            <DetectionHistory />
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-6 animate-fadeIn">
            <NetworkStats />
            <DetectionHistory />
          </div>
        )}

        {activeTab === 'model' && (
          <div className="space-y-6 animate-fadeIn">
            <ModelPerformance />
            <DetectionHistory />
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="space-y-6 animate-fadeIn">
            <ThreatIntel />
            <AttackCards />
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6 animate-fadeIn">
            <SystemHealth />
            <ModelPerformance />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fadeIn">
            <AttackTimeline />
            <DetectionHistory />
          </div>
        )}

        {activeTab === 'datasources' && (
          <div className="space-y-6 animate-fadeIn">
            <DataSources />
          </div>
        )}

        {activeTab === 'livestream' && (
          <div className="space-y-6 animate-fadeIn">
            <LiveStream />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6 animate-fadeIn">
            <MLFeatures />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`relative border-t mt-12 transition-colors duration-300 ${
        isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/60 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            <div className="flex items-center gap-4">
              <span>IDS System v2.4.1</span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Monitoring
              </span>
            </div>
            <div>
              <span>Last Update: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t text-center ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              © 2024 All Rights Reserved | Developed by Sai
            </p>
          </div>
        </div>
      </footer>

      {/* Editable User Profile Modal */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <AuthProvider isDark={isDark}>
      <DashboardContent isDark={isDark} toggleTheme={toggleTheme} />
    </AuthProvider>
  );
}

export default App;

