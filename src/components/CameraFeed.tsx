import React, { useState, useEffect } from 'react';
import { Camera, Video, Upload, Play, Pause, RotateCcw } from 'lucide-react';
import { MonitoringModule } from '../App';
import RealCameraFeed from './RealCameraFeed';

interface CameraFeedProps {
  moduleId: MonitoringModule;
  isMonitoring: boolean;
  onAnalysisUpdate?: (analysis: any) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ moduleId, isMonitoring, onAnalysisUpdate }) => {
  const [inputType, setInputType] = useState<'camera' | 'video'>('camera');
  const [useRealCV, setUseRealCV] = useState(true);

  // If real CV is enabled and we're using camera input, show the real camera feed
  if (useRealCV && inputType === 'camera') {
    return (
      <RealCameraFeed 
        moduleId={moduleId} 
        isMonitoring={isMonitoring}
        onAnalysisUpdate={onAnalysisUpdate || (() => {})}
      />
    );
  }

  // Fallback to mock interface for video input or when real CV is disabled
  const getModuleSpecificInfo = () => {
    switch (moduleId) {
      case 'classroom-behavior':
        return {
          title: 'Classroom Activity Detection',
          indicators: ['Students: 24', 'Attention: 87%', 'Disruptions: 2']
        };
      case 'exam-supervision':
        return {
          title: 'Exam Integrity Monitoring',
          indicators: ['Candidates: 45', 'Violations: 0', 'Gaze: Normal']
        };
      case 'occupancy-monitoring':
        return {
          title: 'Space Utilization',
          indicators: ['Occupancy: 78%', 'Available: 12', 'Capacity: 60']
        };
      case 'compliance-check':
        return {
          title: 'Compliance Monitoring',
          indicators: ['Mask: 94%', 'Uniform: 98%', 'Violations: 3']
        };
      case 'safety-detection':
        return {
          title: 'Safety Monitoring',
          indicators: ['Fire: Clear', 'Smoke: Clear', 'Emergency: None']
        };
      default:
        return {
          title: 'Camera Feed',
          indicators: ['Status: Active', 'FPS: 30', 'Quality: HD']
        };
    }
  };

  const moduleInfo = getModuleSpecificInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{moduleInfo.title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseRealCV(!useRealCV)}
            className={`px-3 py-1 rounded text-xs ${
              useRealCV ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {useRealCV ? 'Real CV' : 'Demo'}
          </button>
          <button
            onClick={() => setInputType('camera')}
            className={`p-2 rounded-lg ${
              inputType === 'camera' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInputType('video')}
            className={`p-2 rounded-lg ${
              inputType === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Feed Area */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        {/* Simulated video feed */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          {isMonitoring ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-white text-sm">Demo Mode Active</p>
              <p className="text-gray-400 text-xs">Switch to "Real CV" for actual detection</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Pause className="w-8 h-8 text-white" />
              </div>
              <p className="text-white text-sm">Feed Inactive</p>
              <p className="text-gray-400 text-xs">Click Start Monitoring to begin</p>
            </div>
          )}
        </div>

        {/* Detection Overlays */}
        {isMonitoring && (
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {inputType === 'camera' ? 'Camera 1' : 'Video Feed'} • {new Date().toLocaleTimeString()}
            </div>
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">
              REC
            </div>
          </div>
        )}
      </div>

      {/* Feed Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-yellow-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isMonitoring ? 'Demo Mode' : 'Standby'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {moduleInfo.indicators.map((indicator, index) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded">
              {indicator}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;