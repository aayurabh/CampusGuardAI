import React, { useState } from 'react';
import { X, Camera, Bell, Shield, Sliders, Save, RotateCcw } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      cameraResolution: '1080p',
      frameRate: '30',
      recordingEnabled: true,
      autoSave: true
    },
    alerts: {
      soundEnabled: true,
      emailNotifications: true,
      alertThreshold: 'medium',
      maxAlerts: '50'
    },
    detection: {
      sensitivity: '75',
      confidenceThreshold: '80',
      trackingEnabled: true,
      batchProcessing: false
    },
    security: {
      encryptionEnabled: true,
      accessLogging: true,
      sessionTimeout: '30',
      dataRetention: '30'
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Camera },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'detection', label: 'Detection', icon: Sliders },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Camera Resolution</label>
        <select
          value={settings.general.cameraResolution}
          onChange={(e) => handleSettingChange('general', 'cameraResolution', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4K">4K</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frame Rate (FPS)</label>
        <select
          value={settings.general.frameRate}
          onChange={(e) => handleSettingChange('general', 'frameRate', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="60">60</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Recording Enabled</span>
        <button
          onClick={() => handleSettingChange('general', 'recordingEnabled', !settings.general.recordingEnabled)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.general.recordingEnabled ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.general.recordingEnabled ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Auto Save</span>
        <button
          onClick={() => handleSettingChange('general', 'autoSave', !settings.general.autoSave)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.general.autoSave ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.general.autoSave ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>
    </div>
  );

  const renderAlertSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Sound Notifications</span>
        <button
          onClick={() => handleSettingChange('alerts', 'soundEnabled', !settings.alerts.soundEnabled)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.alerts.soundEnabled ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.alerts.soundEnabled ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
        <button
          onClick={() => handleSettingChange('alerts', 'emailNotifications', !settings.alerts.emailNotifications)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.alerts.emailNotifications ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.alerts.emailNotifications ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold</label>
        <select
          value={settings.alerts.alertThreshold}
          onChange={(e) => handleSettingChange('alerts', 'alertThreshold', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Alerts per Hour</label>
        <input
          type="number"
          value={settings.alerts.maxAlerts}
          onChange={(e) => handleSettingChange('alerts', 'maxAlerts', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderDetectionSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detection Sensitivity: {settings.detection.sensitivity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.detection.sensitivity}
          onChange={(e) => handleSettingChange('detection', 'sensitivity', e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confidence Threshold: {settings.detection.confidenceThreshold}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.detection.confidenceThreshold}
          onChange={(e) => handleSettingChange('detection', 'confidenceThreshold', e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Object Tracking</span>
        <button
          onClick={() => handleSettingChange('detection', 'trackingEnabled', !settings.detection.trackingEnabled)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.detection.trackingEnabled ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.detection.trackingEnabled ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Batch Processing</span>
        <button
          onClick={() => handleSettingChange('detection', 'batchProcessing', !settings.detection.batchProcessing)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.detection.batchProcessing ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.detection.batchProcessing ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Data Encryption</span>
        <button
          onClick={() => handleSettingChange('security', 'encryptionEnabled', !settings.security.encryptionEnabled)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.security.encryptionEnabled ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.security.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Access Logging</span>
        <button
          onClick={() => handleSettingChange('security', 'accessLogging', !settings.security.accessLogging)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            settings.security.accessLogging ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings.security.accessLogging ? 'translate-x-6' : 'translate-x-1'
          } mt-1`} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
        <input
          type="number"
          value={settings.security.dataRetention}
          onChange={(e) => handleSettingChange('security', 'dataRetention', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'alerts':
        return renderAlertSettings();
      case 'detection':
        return renderDetectionSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-96">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-200">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;