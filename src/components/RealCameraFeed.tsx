import React, { useEffect, useState, useRef } from 'react';
import { Camera, Video, Upload, Play, Pause, AlertCircle, CheckCircle } from 'lucide-react';
import { MonitoringModule } from '../App';
import { useWebcam } from '../hooks/useWebcam';
import { cvService, Detection, FaceDetection } from '../services/cvService';

interface RealCameraFeedProps {
  moduleId: MonitoringModule;
  isMonitoring: boolean;
  onAnalysisUpdate: (analysis: any) => void;
}

const RealCameraFeed: React.FC<RealCameraFeedProps> = ({ 
  moduleId, 
  isMonitoring, 
  onAnalysisUpdate 
}) => {
  const { videoRef, isStreaming, error, startWebcam, stopWebcam } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [fps, setFps] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Initialize computer vision models
  useEffect(() => {
    const initializeModels = async () => {
      setIsModelLoading(true);
      try {
        await cvService.initialize();
        setIsModelReady(true);
        console.log('Models initialized successfully');
      } catch (error) {
        console.warn('Model initialization completed with fallbacks:', error.message);
        setIsModelReady(true); // Still allow the app to work with fallback mode
      } finally {
        setIsModelLoading(false);
      }
    };

    initializeModels();
  }, []);

  // Start/stop webcam based on monitoring state
  useEffect(() => {
    if (isMonitoring && isModelReady) {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [isMonitoring, isModelReady]);

  // Main detection loop
  useEffect(() => {
    if (!isStreaming || !isMonitoring || !videoRef.current || !canvasRef.current) {
      return;
    }

    const detectLoop = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Run detections
        const [objectDetections, faceDetections] = await Promise.all([
          cvService.detectObjects(video),
          cvService.detectFaces(video)
        ]);

        setDetections(objectDetections);
        setFaces(faceDetections);

        // Draw detections on canvas
        drawDetections(ctx, objectDetections, faceDetections);

        // Analyze for current module
        const analysis = analyzeDetections(objectDetections, faceDetections);
        onAnalysisUpdate(analysis);

        // Calculate FPS
        const now = performance.now();
        frameCountRef.current++;
        if (now - lastTimeRef.current >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
      } catch (error) {
        console.error('Detection error:', error);
      }

      animationRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isStreaming, isMonitoring, moduleId]);

  const drawDetections = (
    ctx: CanvasRenderingContext2D, 
    objects: Detection[], 
    faces: FaceDetection[]
  ) => {
    // Draw object detections
    objects.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${detection.class} (${Math.round(detection.score * 100)}%)`,
        x,
        y > 20 ? y - 5 : y + 20
      );
    });

    // Draw face detections
    faces.forEach(face => {
      const [x1, y1] = face.topLeft;
      const [x2, y2] = face.bottomRight;
      
      // Draw face box
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      
      // Draw landmarks if available
      if (face.landmarks) {
        ctx.fillStyle = '#ff0000';
        face.landmarks.forEach(landmark => {
          ctx.beginPath();
          ctx.arc(landmark[0], landmark[1], 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  };

  const analyzeDetections = (objects: Detection[], faces: FaceDetection[]) => {
    switch (moduleId) {
      case 'classroom-behavior':
        return cvService.analyzeForClassroom(objects, faces);
      case 'exam-supervision':
        return cvService.analyzeForExam(objects, faces);
      case 'occupancy-monitoring':
        return cvService.analyzeForOccupancy(objects);
      case 'compliance-check':
        return cvService.analyzeForCompliance(objects, faces);
      case 'safety-detection':
        return cvService.analyzeForSafety(objects);
      default:
        return { alerts: [] };
    }
  };

  const getModuleTitle = () => {
    switch (moduleId) {
      case 'classroom-behavior':
        return 'Live Classroom Monitoring';
      case 'exam-supervision':
        return 'Real-time Exam Supervision';
      case 'occupancy-monitoring':
        return 'Live Occupancy Tracking';
      case 'compliance-check':
        return 'Real-time Compliance Check';
      case 'safety-detection':
        return 'Live Safety Monitoring';
      default:
        return 'Live Camera Feed';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{getModuleTitle()}</h3>
        <div className="flex items-center space-x-2">
          {isModelLoading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Loading AI models...</span>
            </div>
          )}
          {isModelReady && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                {cvService.hasRealModels() ? 'AI Ready' : 'Demo Mode'}
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Camera Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Feed Container */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        {/* Hidden video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isStreaming ? 'block' : 'none' }}
          muted
          playsInline
        />
        
        {/* Canvas for drawing detections */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isStreaming ? 'block' : 'none' }}
        />

        {/* Status overlay when not streaming */}
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                {isModelLoading ? (
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                ) : error ? (
                  <AlertCircle className="w-8 h-8 text-red-400" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
              <p className="text-white text-sm">
                {isModelLoading ? 'Loading AI Models...' : 
                 error ? 'Camera Access Error' : 
                 !isModelReady ? 'Initializing AI...' :
                 'Click Start Monitoring to begin'}
              </p>
              {error && (
                <p className="text-gray-400 text-xs mt-1">
                  Please allow camera access and refresh
                </p>
              )}
              {isModelReady && !cvService.hasRealModels() && (
                <p className="text-yellow-400 text-xs mt-1">
                  Running in demo mode - refresh to retry AI models
                </p>
              )}
            </div>
          </div>
        )}

        {/* Live indicators */}
        {isStreaming && (
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              LIVE • {new Date().toLocaleTimeString()} • {fps} FPS
            </div>
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">
              REC
            </div>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Objects: {detections.length} | Faces: {faces.length}
            </div>
          </div>
        )}
      </div>

      {/* Detection Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600">
            {isStreaming ? 'Live Detection Active' : 'Standby'}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-gray-600">
          <span>Objects: {detections.length}</span>
          <span>Faces: {faces.length}</span>
          <span>FPS: {fps}</span>
        </div>
      </div>
    </div>
  );
};

export default RealCameraFeed;