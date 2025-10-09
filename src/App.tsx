import React, { useState } from 'react';
import { Camera, Shield, Users, Eye, Settings, Activity, BarChart3, Flame, Moon, Sun } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import ModuleSelector from './components/ModuleSelector';
import CameraFeed from './components/CameraFeed';
import AlertsPanel from './components/AlertsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import SettingsPanel from './components/SettingsPanel';

export type MonitoringModule = 
  | 'classroom-behavior'
  | 'exam-supervision'
  | 'occupancy-monitoring'
  | 'compliance-check'
  | 'safety-detection'
  | 'overview';

function App() {
  const [activeModule, setActiveModule] = useState<MonitoringModule>('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<unknown>(null);
  const { isDark, toggleTheme } = useTheme();

  const modules = [
    {
      id: 'overview' as MonitoringModule,
      title: 'Overview',
      icon: BarChart3,
      description: 'System overview and analytics',
      color: 'bg-blue-500'
    },
    {
      id: 'classroom-behavior' as MonitoringModule,
      title: 'Classroom Monitoring',
      icon: Users,
      description: 'Behavior and activity monitoring',
      color: 'bg-green-500'
    },
    {
      id: 'exam-supervision' as MonitoringModule,
      title: 'Exam Supervision',
      icon: Eye,
      description: 'Exam integrity monitoring',
      color: 'bg-purple-500'
    },
    {
      id: 'occupancy-monitoring' as MonitoringModule,
      title: 'Occupancy Tracking',
      icon: Activity,
      description: 'Space utilization monitoring',
      color: 'bg-teal-500'
    },
    {
      id: 'compliance-check' as MonitoringModule,
      title: 'Compliance Check',
      icon: Shield,
      description: 'Uniform and mask compliance',
      color: 'bg-orange-500'
    },
    {
      id: 'safety-detection' as MonitoringModule,
      title: 'Safety Detection',
      icon: Flame,
      description: 'Fire and smoke detection',
      color: 'bg-red-500'
    }
  ];

  const currentModule = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CampusGuard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Campus Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Selector */}
          <div className="lg:col-span-1">
            <ModuleSelector
              modules={modules}
              activeModule={activeModule}
              onModuleChange={setActiveModule}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeModule === 'overview' ? (
              <Dashboard />
            ) : (
              <div className="space-y-6">
                {/* Module Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentModule?.color}`}>
                        {currentModule?.icon && <currentModule.icon className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentModule?.title}</h2>
                        <p className="text-gray-600 dark:text-gray-300">{currentModule?.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setIsMonitoring(!isMonitoring)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isMonitoring
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                    </button>
                  </div>
                </div>

                {/* Camera Feed and Analytics */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <CameraFeed 
                    moduleId={activeModule}
                    isMonitoring={isMonitoring}
                    onAnalysisUpdate={setRealTimeAnalysis}
                  />
                  <div className="space-y-6">
                    <AlertsPanel 
                      moduleId={activeModule} 
                      realTimeData={realTimeAnalysis}
                    />
                    <AnalyticsPanel 
                      moduleId={activeModule}
                      realTimeData={realTimeAnalysis}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;