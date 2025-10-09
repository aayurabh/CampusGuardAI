import { useRef, useEffect, useState } from 'react';

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      
      setAvailableCameras(videoDevices);
      
      // Set default camera (prefer back camera if available)
      if (videoDevices.length > 0 && !selectedCameraId) {
        const backCamera = videoDevices.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear')
        );
        setSelectedCameraId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Failed to access camera list. Please grant camera permissions.');
      return [];
    }
  };

  const startWebcam = async (cameraDeviceId?: string) => {
    try {
      const deviceId = cameraDeviceId || selectedCameraId;
      
      if (!deviceId) {
        await getAvailableCameras();
        return;
      }

      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
          setError(null);
        };
      }
    } catch (err) {
      setError('Failed to access the selected camera. Please try a different camera.');
      console.error('Webcam error:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Initialize cameras on mount
  useEffect(() => {
    getAvailableCameras();
    
    return () => {
      stopWebcam();
    };
  }, []);

  // Switch camera
  const switchCamera = async (cameraDeviceId: string) => {
    setSelectedCameraId(cameraDeviceId);
    if (isStreaming) {
      stopWebcam();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await startWebcam(cameraDeviceId);
    }
  };

  return {
    videoRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    availableCameras,
    selectedCameraId,
    switchCamera,
    getAvailableCameras
  };
};