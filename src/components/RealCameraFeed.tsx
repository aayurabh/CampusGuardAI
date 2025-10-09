import React, { useEffect, useState, useRef } from 'react';
import { Camera, AlertCircle, CheckCircle, Settings, ChevronDown } from 'lucide-react';
import { MonitoringModule } from '../App';
import { useWebcam } from '../hooks/useWebcam';
import { cvService, Detection, FaceDetection } from '../services/cvService';

interface RealCameraFeedProps {
  moduleId: MonitoringModule;
  isMonitoring: boolean;
  onAnalysisUpdate: (analysis: unknown) => void;
}

const RealCameraFeed: React.FC<RealCameraFeedProps> = ({ 
  moduleId, 
  isMonitoring, 
  onAnalysisUpdate 
}) => {
  const { 
    videoRef, 
    isStreaming, 
    error, 
    startWebcam, 
    stopWebcam, 
    availableCameras, 
    selectedCameraId, 
    switchCamera 
  } = useWebcam();
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [fps, setFps] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastDetectionTime = useRef<number>(0);
  const detectionInterval = 100; // Limit detections to 10 FPS max
  const cameraSelectorRef = useRef<HTMLDivElement>(null);

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
      if (!videoRef.current || !canvasRef.current) {
        animationRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      const now = performance.now();
      
      // Throttle detections to improve performance
      const shouldRunDetection = now - lastDetectionTime.current >= detectionInterval;

      // Set canvas size to match video with proper scaling
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;
      
      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }

      // Always update the video frame display
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        if (shouldRunDetection) {
          lastDetectionTime.current = now;
          
          // Run detections with timeout to prevent hanging
          const detectionPromise = Promise.race([
            Promise.all([
              cvService.detectObjects(video),
              cvService.detectFaces(video)
            ]),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Detection timeout')), 5000)
            )
          ]) as Promise<[Detection[], FaceDetection[]]>;

          const [objectDetections, faceDetections] = await detectionPromise;

          setDetections(objectDetections);
          setFaces(faceDetections);

          // Draw detections on canvas with proper scaling
          drawDetections(ctx, objectDetections, faceDetections);

          // Analyze for current module
          const analysis = await analyzeDetections(objectDetections, faceDetections);
          onAnalysisUpdate(analysis);
        } else {
          // Redraw existing detections without running new detection
          drawDetections(ctx, detections, faces);
        }

        // Calculate FPS (display FPS, not detection FPS)
        frameCountRef.current++;
        if (now - lastTimeRef.current >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
      } catch (error) {
        console.error('Detection error:', error);
        // Continue displaying video even if detection fails
        if (detections.length > 0 || faces.length > 0) {
          drawDetections(ctx, detections, faces);
        }
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

  // Close camera selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cameraSelectorRef.current && !cameraSelectorRef.current.contains(event.target as Node)) {
        setShowCameraSelector(false);
      }
    };

    if (showCameraSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCameraSelector]);

  const drawDetections = (
    ctx: CanvasRenderingContext2D, 
    objects: Detection[], 
    faces: FaceDetection[]
  ) => {
    // Clear previous drawings
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Redraw the video frame
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Draw object detections with improved styling
    objects.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Scale coordinates to canvas size
      const scaleX = ctx.canvas.width / (videoRef.current?.videoWidth || ctx.canvas.width);
      const scaleY = ctx.canvas.height / (videoRef.current?.videoHeight || ctx.canvas.height);
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Choose color based on object type
      const color = getObjectColor(detection.class);
      
      // Draw bounding box with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw label background
      const label = `${detection.class} (${Math.round(detection.score * 100)}%)`;
      ctx.font = '14px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        scaledX, 
        scaledY > textHeight ? scaledY - textHeight : scaledY + scaledHeight,
        textMetrics.width + 8,
        textHeight
      );
      
      // Draw label text
      ctx.fillStyle = color;
      ctx.shadowBlur = 0;
      ctx.fillText(
        label,
        scaledX + 4,
        scaledY > textHeight ? scaledY - 5 : scaledY + scaledHeight + 15
      );
    });

    // Draw face detections with mask indicators
    faces.forEach((face) => {
      const [x1, y1] = face.topLeft;
      const [x2, y2] = face.bottomRight;
      
      // Scale coordinates
      const scaleX = ctx.canvas.width / (videoRef.current?.videoWidth || ctx.canvas.width);
      const scaleY = ctx.canvas.height / (videoRef.current?.videoHeight || ctx.canvas.height);
      
      const scaledX1 = x1 * scaleX;
      const scaledY1 = y1 * scaleY;
      const scaledX2 = x2 * scaleX;
      const scaledY2 = y2 * scaleY;
      
      // Choose color based on mask detection
      const faceColor = face.hasMask ? '#00ff00' : '#ff6600';
      
      // Draw face box
      ctx.strokeStyle = faceColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.strokeRect(scaledX1, scaledY1, scaledX2 - scaledX1, scaledY2 - scaledY1);
      
      // Draw mask status label
      const maskLabel = face.hasMask 
        ? `Mask (${Math.round((face.maskConfidence || 0) * 100)}%)` 
        : 'No Mask';
      
      ctx.font = '12px Arial';
      const textMetrics = ctx.measureText(maskLabel);
      
      // Label background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(scaledX1, scaledY1 - 18, textMetrics.width + 6, 16);
      
      // Label text
      ctx.fillStyle = faceColor;
      ctx.shadowBlur = 0;
      ctx.fillText(maskLabel, scaledX1 + 3, scaledY1 - 5);
      
      // Draw landmarks if available
      if (face.landmarks) {
        ctx.fillStyle = faceColor;
        face.landmarks.forEach(landmark => {
          const scaledLandmarkX = landmark[0] * scaleX;
          const scaledLandmarkY = landmark[1] * scaleY;
          ctx.beginPath();
          ctx.arc(scaledLandmarkX, scaledLandmarkY, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const getObjectColor = (objectClass: string): string => {
    const colorMap: { [key: string]: string } = {
      'person': '#00ff00',
      'cell phone': '#ff0000',
      'laptop': '#ff6600',
      'book': '#0066ff',
      'chair': '#ffff00',
      'backpack': '#ff00ff',
      'bottle': '#00ffff'
    };
    return colorMap[objectClass] || '#ffffff';
  };

  const analyzeDetections = async (objects: Detection[], faces: FaceDetection[]) => {
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
        return await cvService.analyzeForSafety(objects, videoRef.current);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getModuleTitle()}</h3>
        <div className="flex items-center space-x-2">
          {/* Camera Selector */}
          {availableCameras.length > 1 && (
            <div className="relative" ref={cameraSelectorRef}>
              <button
                onClick={() => setShowCameraSelector(!showCameraSelector)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Select Camera"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Camera</span>
                <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>
              
              {showCameraSelector && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-64">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Available Cameras</div>
                    {availableCameras.map((camera) => (
                      <button
                        key={camera.deviceId}
                        onClick={() => {
                          switchCamera(camera.deviceId);
                          setShowCameraSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedCameraId === camera.deviceId ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{camera.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {camera.deviceId.slice(0, 16)}...
                            </div>
                          </div>
                          {selectedCameraId === camera.deviceId && (
                            <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
              <p className="text-white dark:text-gray-200 text-sm">
                {isModelLoading ? 'Loading AI Models...' :
                 error ? 'Camera Access Error' :
                 !isModelReady ? 'Initializing AI...' :
                 availableCameras.length === 0 ? 'Detecting cameras...' :
                 'Click Start Monitoring to begin'}
              </p>
              {availableCameras.length > 1 && !isStreaming && (
                <p className="text-blue-400 dark:text-blue-300 text-xs mt-1">
                  {availableCameras.length} cameras detected - use camera selector above
                </p>
              )}
              {error && (
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Please allow camera access and refresh
                </p>
              )}
              {isModelReady && !cvService.hasRealModels() && (
                <p className="text-yellow-400 dark:text-yellow-300 text-xs mt-1">
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
              Objects: {detections.length} | Faces: {faces.length} | AI: {cvService.hasRealModels() ? 'Real' : 'Demo'}
            </div>
          </div>
        )}
      </div>

      {/* Detection Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600 dark:text-gray-300">
            {isStreaming ? 'Live Detection Active' : 'Standby'}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
          <span>Objects: {detections.length}</span>
          <span>Faces: {faces.length}</span>
          <span>FPS: {fps}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            cvService.hasRealModels() ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
          }`}>
            {cvService.hasRealModels() ? 'AI Active' : 'Demo Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealCameraFeed;