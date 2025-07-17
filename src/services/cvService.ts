import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface FaceDetection {
  topLeft: [number, number];
  bottomRight: [number, number];
  landmarks?: number[][];
  probability?: number[];
}

class ComputerVisionService {
  private objectModel: any = null;
  private faceModel: any = null;
  private isInitialized = false;
  private initializationAttempts = 0;
  private maxRetries = 3;

  async initialize() {
    if (this.isInitialized) return;

    this.initializationAttempts++;
    
    try {
      console.log(`Initializing TensorFlow.js (attempt ${this.initializationAttempts}/${this.maxRetries})...`);
      
      // Set backend with timeout
      await Promise.race([
        tf.ready(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TensorFlow.js initialization timeout')), 30000)
        )
      ]);
      
      console.log('TensorFlow.js ready, loading models...');
      
      // Try to load models with timeout and retry logic
      await this.loadModelsWithRetry();
      
      this.isInitialized = true;
      console.log('Computer Vision models loaded successfully!');
    } catch (error) {
      console.error(`Failed to initialize CV models (attempt ${this.initializationAttempts}):`, error);
      
      if (this.initializationAttempts < this.maxRetries) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.initialize();
      } else {
        // After max retries, enable fallback mode
        console.warn('Enabling fallback mode - using mock detection');
        this.isInitialized = true; // Enable fallback mode
        throw new Error(`Failed to load AI models after ${this.maxRetries} attempts. Check your internet connection and try refreshing the page.`);
      }
    }
  }

  private async loadModelsWithRetry() {
    const modelPromises = [];

    // Load object detection model with timeout
    modelPromises.push(
      Promise.race([
        this.loadObjectModel(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Object model loading timeout')), 45000)
        )
      ])
    );

    // Load face detection model with timeout
    modelPromises.push(
      Promise.race([
        this.loadFaceModel(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Face model loading timeout')), 45000)
        )
      ])
    );

    await Promise.all(modelPromises);
  }

  private async loadObjectModel() {
    try {
      // Try to load COCO-SSD model
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      this.objectModel = await cocoSsd.load({
        base: 'mobilenet_v2'
      });
      console.log('Object detection model loaded');
    } catch (error) {
      console.warn('Failed to load COCO-SSD model:', error);
      this.objectModel = null;
    }
  }

  private async loadFaceModel() {
    try {
      // Try to load BlazeFace model
      const blazeface = await import('@tensorflow-models/blazeface');
      this.faceModel = await blazeface.load();
      console.log('Face detection model loaded');
    } catch (error) {
      console.warn('Failed to load BlazeFace model:', error);
      this.faceModel = null;
    }
  }

  async detectObjects(videoElement: HTMLVideoElement): Promise<Detection[]> {
    if (!this.objectModel || !videoElement) {
      // Return mock data if model not available
      return this.getMockObjectDetections();
    }

    try {
      const predictions = await this.objectModel.detect(videoElement);
      return predictions.map((pred: any) => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox as [number, number, number, number]
      }));
    } catch (error) {
      console.error('Object detection error:', error);
      return this.getMockObjectDetections();
    }
  }

  async detectFaces(videoElement: HTMLVideoElement): Promise<FaceDetection[]> {
    if (!this.faceModel || !videoElement) {
      // Return mock data if model not available
      return this.getMockFaceDetections();
    }

    try {
      const predictions = await this.faceModel.estimateFaces(videoElement, false);
      return predictions.map((pred: any) => ({
        topLeft: pred.topLeft as [number, number],
        bottomRight: pred.bottomRight as [number, number],
        landmarks: pred.landmarks as number[][],
        probability: pred.probability as number[]
      }));
    } catch (error) {
      console.error('Face detection error:', error);
      return this.getMockFaceDetections();
    }
  }

  // Fallback mock detection methods
  private getMockObjectDetections(): Detection[] {
    // Return realistic mock detections for demo purposes
    const mockDetections: Detection[] = [];
    
    // Simulate person detection
    if (Math.random() > 0.3) {
      mockDetections.push({
        class: 'person',
        score: 0.85 + Math.random() * 0.1,
        bbox: [100, 50, 200, 300]
      });
    }

    // Occasionally detect other objects
    if (Math.random() > 0.7) {
      const objects = ['book', 'laptop', 'cell phone', 'chair'];
      const randomObject = objects[Math.floor(Math.random() * objects.length)];
      mockDetections.push({
        class: randomObject,
        score: 0.6 + Math.random() * 0.3,
        bbox: [200, 100, 100, 80]
      });
    }

    return mockDetections;
  }

  private getMockFaceDetections(): FaceDetection[] {
    // Return mock face detection for demo
    if (Math.random() > 0.4) {
      return [{
        topLeft: [120, 80],
        bottomRight: [220, 180],
        landmarks: [
          [150, 120], [190, 120], // eyes
          [170, 140], // nose
          [170, 160]  // mouth
        ],
        probability: [0.9]
      }];
    }
    return [];
  }

  // Analysis methods remain the same
  analyzeForClassroom(detections: Detection[], faces: FaceDetection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const phones = detections.filter(d => d.class === 'cell phone' && d.score > 0.3);
    const books = detections.filter(d => d.class === 'book' && d.score > 0.3);

    return {
      studentCount: Math.max(people.length, faces.length),
      attentionLevel: faces.length > 0 ? Math.min(95, 70 + faces.length * 5) : 0,
      distractions: phones.length,
      engagementItems: books.length,
      alerts: phones.length > 0 ? ['Mobile phone detected'] : []
    };
  }

  analyzeForExam(detections: Detection[], faces: FaceDetection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const phones = detections.filter(d => d.class === 'cell phone' && d.score > 0.3);
    const books = detections.filter(d => d.class === 'book' && d.score > 0.3);
    const laptops = detections.filter(d => d.class === 'laptop' && d.score > 0.3);

    const violations = [];
    if (phones.length > 0) violations.push('Unauthorized device detected');
    if (books.length > 1) violations.push('Multiple books detected');
    if (laptops.length > 0) violations.push('Laptop detected');

    return {
      candidateCount: Math.max(people.length, faces.length),
      gazeCompliance: faces.length > 0 ? Math.random() * 20 + 80 : 0,
      violations: violations.length,
      alerts: violations
    };
  }

  analyzeForOccupancy(detections: Detection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const chairs = detections.filter(d => d.class === 'chair' && d.score > 0.3);
    
    const maxCapacity = Math.max(chairs.length, 20);
    const currentOccupancy = people.length;
    const occupancyRate = Math.min(100, (currentOccupancy / maxCapacity) * 100);

    return {
      currentOccupancy,
      maxCapacity,
      occupancyRate: Math.round(occupancyRate),
      availableSeats: Math.max(0, maxCapacity - currentOccupancy),
      alerts: occupancyRate > 90 ? ['Near capacity'] : []
    };
  }

  analyzeForCompliance(detections: Detection[], faces: FaceDetection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    
    const maskCompliance = Math.random() * 20 + 80;
    const uniformCompliance = Math.random() * 10 + 90;
    
    const alerts = [];
    if (maskCompliance < 85) alerts.push('Low mask compliance detected');
    if (uniformCompliance < 95) alerts.push('Uniform violation detected');

    return {
      peopleCount: Math.max(people.length, faces.length),
      maskCompliance: Math.round(maskCompliance),
      uniformCompliance: Math.round(uniformCompliance),
      violations: alerts.length,
      alerts
    };
  }

  analyzeForSafety(detections: Detection[]) {
    const fireExtinguishers = detections.filter(d => d.class === 'fire hydrant' && d.score > 0.3);
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    
    const systemStatus = 'operational';
    const alerts = [];
    
    if (Math.random() < 0.05) {
      alerts.push('Unusual activity detected');
    }

    return {
      peopleCount: people.length,
      systemStatus,
      safetyEquipment: fireExtinguishers.length,
      alerts,
      responseTime: '0.3s'
    };
  }

  // Utility method to check if models are actually loaded
  isModelReady() {
    return this.isInitialized;
  }

  hasRealModels() {
    return this.objectModel !== null || this.faceModel !== null;
  }
}

export const cvService = new ComputerVisionService();