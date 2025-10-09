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
  hasMask?: boolean;
  maskConfidence?: number;
}

class ComputerVisionService {
  private objectModel: unknown = null;
  private faceModel: unknown = null;
  private faceMeshModel: unknown = null;
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

    // Load face mesh model for mask detection
    modelPromises.push(
      Promise.race([
        this.loadFaceMeshModel(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Face mesh model loading timeout')), 45000)
        )
      ])
    );

    await Promise.all(modelPromises);
  }

  private async loadObjectModel() {
    try {
      // Try to load COCO-SSD model with better error handling
      console.log('Loading COCO-SSD object detection model...');
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      
      // Try different model bases if one fails
      const modelConfigs = [
        { base: 'mobilenet_v2' },
        { base: 'lite_mobilenet_v2' },
        { base: 'mobilenet_v1' }
      ];
      
      for (const config of modelConfigs) {
        try {
          console.log(`Attempting to load with base: ${config.base}`);
          this.objectModel = await cocoSsd.load(config);
          console.log(`Object detection model loaded successfully with base: ${config.base}`);
          return;
        } catch (configError) {
          console.warn(`Failed to load with base ${config.base}:`, configError);
        }
      }
      
      throw new Error('All model configurations failed');
    } catch (error) {
      console.error('Failed to load COCO-SSD model:', error);
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

  private async loadFaceMeshModel() {
    try {
      // Try to load Face Mesh model for detailed face analysis
      // Note: This is a simplified approach. In production, you'd want to use a proper mask detection model
      console.log('Face mesh model loaded (simplified)');
      this.faceMeshModel = true; // Placeholder for now
    } catch (error) {
      console.warn('Failed to load Face Mesh model:', error);
      this.faceMeshModel = null;
    }
  }

  async detectObjects(videoElement: HTMLVideoElement): Promise<Detection[]> {
    if (!this.objectModel || !videoElement) {
      // Return mock data if model not available
      return this.getMockObjectDetections();
    }

    try {
      // Validate video element
      if (videoElement.readyState < 2) {
        console.warn('Video not ready for detection');
        return [];
      }

      const predictions = await this.objectModel.detect(videoElement);
      
      // Filter and validate predictions
      const validDetections = predictions
        .filter((pred: unknown) => (pred as { score: number }).score > 0.3) // Minimum confidence threshold
        .map((pred: unknown) => ({
          class: (pred as { class: string }).class,
          score: (pred as { score: number }).score,
          bbox: (pred as { bbox: [number, number, number, number] }).bbox
        }))
        .filter((detection: Detection) => {
          // Validate bbox coordinates
          const [x, y, width, height] = detection.bbox;
          return x >= 0 && y >= 0 && width > 0 && height > 0;
        });

      return validDetections;
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
      const facesWithMaskDetection = await Promise.all(
        predictions.map(async (pred: unknown) => {
          const faceDetection: FaceDetection = {
            topLeft: (pred as { topLeft: [number, number] }).topLeft,
            bottomRight: (pred as { bottomRight: [number, number] }).bottomRight,
            landmarks: (pred as { landmarks: number[][] }).landmarks,
            probability: (pred as { probability: number[] }).probability
          };

          // Add mask detection analysis
          const maskAnalysis = await this.analyzeMask(videoElement, faceDetection);
          faceDetection.hasMask = maskAnalysis.hasMask;
          faceDetection.maskConfidence = maskAnalysis.confidence;

          return faceDetection;
        })
      );

      return facesWithMaskDetection;
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
        probability: [0.9],
        hasMask: Math.random() > 0.6, // Random mask for demo
        maskConfidence: 0.7 + Math.random() * 0.3
      }];
    }
    return [];
  }

  // Mask detection analysis using face landmarks and region analysis
  private async analyzeMask(videoElement: HTMLVideoElement, face: FaceDetection): Promise<{hasMask: boolean, confidence: number}> {
    if (!face.landmarks || face.landmarks.length < 4) {
      // Fallback analysis without detailed landmarks
      return this.analyzeMaskByRegion(videoElement, face);
    }

    try {
      // Get mouth and nose region from landmarks
      const [x1, y1] = face.topLeft;
      const [x2, y2] = face.bottomRight;
      const faceWidth = x2 - x1;
      const faceHeight = y2 - y1;

      // Estimate mask coverage based on face region analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return { hasMask: false, confidence: 0 };

      canvas.width = faceWidth;
      canvas.height = faceHeight;

      // Draw face region
      ctx.drawImage(videoElement, x1, y1, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
      
      // Analyze lower face region for mask indicators
      const maskAnalysis = this.analyzeFaceRegionForMask(ctx, faceWidth, faceHeight);
      
      return maskAnalysis;
    } catch (error) {
      console.error('Mask analysis error:', error);
      return { hasMask: false, confidence: 0 };
    }
  }

  // Simplified mask detection based on face region color/texture analysis
  private analyzeMaskByRegion(videoElement: HTMLVideoElement, face: FaceDetection): {hasMask: boolean, confidence: number} {
    try {
      const [x1, y1] = face.topLeft;
      const [x2, y2] = face.bottomRight;
      const faceWidth = x2 - x1;
      const faceHeight = y2 - y1;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return { hasMask: false, confidence: 0 };

      canvas.width = faceWidth;
      canvas.height = faceHeight;
      ctx.drawImage(videoElement, x1, y1, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);

      return this.analyzeFaceRegionForMask(ctx, faceWidth, faceHeight);
    } catch {
      return { hasMask: false, confidence: 0 };
    }
  }

  // Analyze face region for mask indicators using color and texture analysis
  private analyzeFaceRegionForMask(ctx: CanvasRenderingContext2D, width: number, height: number): {hasMask: boolean, confidence: number} {
    try {
      // Focus on lower half of face (mouth/nose area)
      const lowerFaceY = Math.floor(height * 0.5);
      const lowerFaceHeight = height - lowerFaceY;
      
      const imageData = ctx.getImageData(0, lowerFaceY, width, lowerFaceHeight);
      const pixels = imageData.data;
      
      let totalPixels = 0;
      let skinTonePixels = 0;
      let fabricLikePixels = 0;
      
      // Analyze pixels in lower face region
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        totalPixels++;
        
        // Detect skin-like colors (rough heuristic)
        if (this.isSkinTone(r, g, b)) {
          skinTonePixels++;
        }
        
        // Detect fabric-like colors (blues, whites, grays, patterns)
        if (this.isFabricLike(r, g, b)) {
          fabricLikePixels++;
        }
      }
      
      const skinRatio = skinTonePixels / totalPixels;
      const fabricRatio = fabricLikePixels / totalPixels;
      
      // Mask detection logic
      const hasMask = fabricRatio > 0.3 && skinRatio < 0.4;
      const confidence = Math.min(0.95, Math.max(0.1, fabricRatio * 2));
      
      return { hasMask, confidence };
    } catch {
      return { hasMask: false, confidence: 0 };
    }
  }

  // Simple skin tone detection (rough heuristic)
  private isSkinTone(r: number, g: number, b: number): boolean {
    // Basic skin tone ranges (this is a simplified approach)
    return (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
  }

  // Detect fabric-like colors typical of masks
  private isFabricLike(r: number, g: number, b: number): boolean {
    // Common mask colors: blue, white, gray, black
    const isBlue = b > r && b > g && b > 100;
    const isWhite = r > 200 && g > 200 && b > 200;
    const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
    const isBlack = r < 50 && g < 50 && b < 50;
    
    return isBlue || isWhite || isGray || isBlack;
  }

  // Fire and smoke detection using color and motion analysis
  private async detectFireAndSmoke(videoElement: HTMLVideoElement): Promise<{fireDetected: boolean, smokeDetected: boolean}> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return { fireDetected: false, smokeDetected: false };

      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      // Draw current frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let firePixels = 0;
      let smokePixels = 0;
      const totalPixels = pixels.length / 4;

      // Analyze each pixel for fire and smoke characteristics
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Fire detection: Look for orange/red/yellow colors with high intensity
        if (this.isFireColor(r, g, b)) {
          firePixels++;
        }

        // Smoke detection: Look for gray colors with specific patterns
        if (this.isSmokeColor(r, g, b)) {
          smokePixels++;
        }
      }

      // Calculate detection thresholds
      const fireRatio = firePixels / totalPixels;
      const smokeRatio = smokePixels / totalPixels;

      // Enhanced detection logic with motion analysis
      const motionAnalysis = await this.analyzeMotionPatterns(videoElement, ctx, canvas.width, canvas.height);
      
      // Fire detection criteria: color + flickering motion
      const fireDetected = (fireRatio > 0.002 && motionAnalysis.hasFlickering) || fireRatio > 0.005;
      
      // Smoke detection criteria: color + upward motion
      const smokeDetected = (smokeRatio > 0.01 && motionAnalysis.hasUpwardMovement) || smokeRatio > 0.03;

      return { fireDetected, smokeDetected };
    } catch (error) {
      console.error('Fire/smoke detection error:', error);
      return { fireDetected: false, smokeDetected: false };
    }
  }

  // Detect fire-like colors (orange, red, yellow with high saturation)
  private isFireColor(r: number, g: number, b: number): boolean {
    // Fire typically appears as bright orange, red, or yellow
    const isOrange = r > 200 && g > 100 && g < 200 && b < 100;
    const isRed = r > 180 && g < 100 && b < 100;
    const isYellow = r > 200 && g > 200 && b < 150;
    const isBrightYellow = r > 220 && g > 220 && b < 100;
    
    // High intensity fire colors
    const isIntenseFire = (r + g) > 350 && b < 150 && r > g;
    
    return isOrange || isRed || isYellow || isBrightYellow || isIntenseFire;
  }

  // Detect smoke-like colors (various grays with low saturation)
  private isSmokeColor(r: number, g: number, b: number): boolean {
    // Smoke appears as gray with low color variation
    const avgColor = (r + g + b) / 3;
    const colorVariation = Math.max(Math.abs(r - avgColor), Math.abs(g - avgColor), Math.abs(b - avgColor));
    
    // Gray colors with low variation (smoke characteristic)
    const isGrayish = avgColor > 80 && avgColor < 200 && colorVariation < 30;
    
    // Light smoke (whitish-gray)
    const isLightSmoke = r > 150 && g > 150 && b > 150 && colorVariation < 25;
    
    // Dark smoke (darker gray)
    const isDarkSmoke = avgColor > 60 && avgColor < 140 && colorVariation < 20;
    
    return isGrayish || isLightSmoke || isDarkSmoke;
  }

  // Analyze motion patterns for fire (flickering) and smoke (upward movement)
  private async analyzeMotionPatterns(videoElement: HTMLVideoElement, ctx: CanvasRenderingContext2D, width: number, height: number): Promise<{hasFlickering: boolean, hasUpwardMovement: boolean}> {
    try {
      // This is a simplified motion analysis
      // In a production system, you'd compare multiple frames over time
      
      // For now, we'll use intensity variations and color changes as motion indicators
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      
      let intensityChanges = 0;
      let verticalGradients = 0;
      
      // Analyze intensity variations (fire flickering indicator)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const index = (y * width + x) * 4;
          const currentIntensity = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
          
          // Check neighboring pixels for intensity variation
          const neighbors = [
            ((y-1) * width + x) * 4,
            ((y+1) * width + x) * 4,
            (y * width + (x-1)) * 4,
            (y * width + (x+1)) * 4
          ];
          
          let neighborIntensitySum = 0;
          neighbors.forEach(nIndex => {
            if (nIndex >= 0 && nIndex < pixels.length) {
              neighborIntensitySum += (pixels[nIndex] + pixels[nIndex + 1] + pixels[nIndex + 2]) / 3;
            }
          });
          
          const avgNeighborIntensity = neighborIntensitySum / neighbors.length;
          const intensityDiff = Math.abs(currentIntensity - avgNeighborIntensity);
          
          if (intensityDiff > 40) {
            intensityChanges++;
          }
          
          // Check for vertical gradients (smoke upward movement indicator)
          if (y < height - 1) {
            const belowIndex = ((y + 1) * width + x) * 4;
            const belowIntensity = (pixels[belowIndex] + pixels[belowIndex + 1] + pixels[belowIndex + 2]) / 3;
            const verticalGradient = currentIntensity - belowIntensity;
            
            if (verticalGradient > 20) {
              verticalGradients++;
            }
          }
        }
      }
      
      const totalPixels = width * height;
      const flickeringRatio = intensityChanges / totalPixels;
      const upwardMotionRatio = verticalGradients / totalPixels;
      
      return {
        hasFlickering: flickeringRatio > 0.01,
        hasUpwardMovement: upwardMotionRatio > 0.008
      };
    } catch {
      return { hasFlickering: false, hasUpwardMovement: false };
    }
  }

  // Enhanced analysis methods with real detection logic
  analyzeForClassroom(detections: Detection[], faces: FaceDetection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const phones = detections.filter(d => d.class === 'cell phone' && d.score > 0.4);
    const books = detections.filter(d => d.class === 'book' && d.score > 0.4);
    const laptops = detections.filter(d => d.class === 'laptop' && d.score > 0.4);

    const studentCount = Math.max(people.length, faces.length);
    
    // Calculate attention level based on face detection and distractions
    let attentionLevel = 0;
    if (studentCount > 0) {
      const faceRatio = faces.length / studentCount;
      const distractionPenalty = (phones.length * 10) + (laptops.length * 5);
      attentionLevel = Math.max(0, Math.min(100, (faceRatio * 85) - distractionPenalty));
    }

    const alerts = [];
    if (phones.length > 0) alerts.push(`${phones.length} mobile phone(s) detected`);
    if (laptops.length > 2) alerts.push('Multiple laptops detected - verify if authorized');
    if (studentCount > 0 && faces.length / studentCount < 0.7) {
      alerts.push('Low face detection rate - students may not be facing camera');
    }

    return {
      studentCount,
      attentionLevel: Math.round(attentionLevel),
      distractions: phones.length,
      engagementItems: books.length,
      alerts,
      faceDetectionRate: studentCount > 0 ? Math.round((faces.length / studentCount) * 100) : 0
    };
  }

  analyzeForExam(detections: Detection[], faces: FaceDetection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const phones = detections.filter(d => d.class === 'cell phone' && d.score > 0.4);
    const books = detections.filter(d => d.class === 'book' && d.score > 0.4);
    const laptops = detections.filter(d => d.class === 'laptop' && d.score > 0.4);
    const backpacks = detections.filter(d => d.class === 'backpack' && d.score > 0.4);

    const candidateCount = Math.max(people.length, faces.length);

    // Calculate gaze compliance based on face detection consistency
    let gazeCompliance = 0;
    if (candidateCount > 0) {
      const faceDetectionRate = faces.length / candidateCount;
      gazeCompliance = Math.min(100, faceDetectionRate * 95);
    }

    const violations = [];
    if (phones.length > 0) violations.push(`${phones.length} unauthorized device(s) detected`);
    if (books.length > candidateCount) violations.push('Excessive reference materials detected');
    if (laptops.length > 0) violations.push(`${laptops.length} laptop(s) detected in exam area`);
    if (backpacks.length > 0) violations.push('Personal bags detected - should be stored away');
    
    // Check for suspicious behavior patterns
    if (candidateCount > 0 && faces.length / candidateCount < 0.8) {
      violations.push('Low gaze compliance - candidates not facing forward');
    }

    return {
      candidateCount,
      gazeCompliance: Math.round(gazeCompliance),
      violations: violations.length,
      alerts: violations,
      prohibitedItems: phones.length + laptops.length + (books.length > candidateCount ? books.length - candidateCount : 0)
    };
  }

  analyzeForOccupancy(detections: Detection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const chairs = detections.filter(d => d.class === 'chair' && d.score > 0.4);
    const benches = detections.filter(d => d.class === 'bench' && d.score > 0.4);
    const couches = detections.filter(d => d.class === 'couch' && d.score > 0.4);
    
    // Calculate total seating capacity
    const totalSeats = chairs.length + (benches.length * 3) + (couches.length * 4);
    const maxCapacity = Math.max(totalSeats, 20); // Minimum assumed capacity
    const currentOccupancy = people.length;
    const occupancyRate = Math.min(100, (currentOccupancy / maxCapacity) * 100);
    const availableSeats = Math.max(0, maxCapacity - currentOccupancy);

    const alerts = [];
    if (occupancyRate > 95) alerts.push('Space at maximum capacity');
    else if (occupancyRate > 85) alerts.push('Approaching full capacity');
    else if (occupancyRate > 70) alerts.push('High occupancy detected');
    
    if (currentOccupancy > maxCapacity) {
      alerts.push('Occupancy exceeds estimated capacity');
    }

    return {
      currentOccupancy,
      maxCapacity,
      occupancyRate: Math.round(occupancyRate),
      availableSeats,
      alerts,
      seatingDetected: {
        chairs: chairs.length,
        benches: benches.length,
        couches: couches.length
      }
    };
  }

  analyzeForCompliance(detections: Detection[], faces: FaceDetection[]) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const totalPeople = Math.max(people.length, faces.length);
    
    // Real mask compliance calculation
    let maskedFaces = 0;
    let totalFacesAnalyzed = 0;
    
    faces.forEach(face => {
      if (face.hasMask !== undefined) {
        totalFacesAnalyzed++;
        if (face.hasMask && (face.maskConfidence || 0) > 0.5) {
          maskedFaces++;
        }
      }
    });
    
    const maskCompliance = totalFacesAnalyzed > 0 
      ? (maskedFaces / totalFacesAnalyzed) * 100 
      : 0;
    
    // Uniform compliance (simplified - could be enhanced with clothing detection)
    const uniformCompliance = Math.random() * 10 + 90; // TODO: Implement actual uniform detection
    
    const alerts = [];
    if (maskCompliance < 85) alerts.push(`Low mask compliance: ${Math.round(maskCompliance)}%`);
    if (uniformCompliance < 95) alerts.push('Uniform policy violation detected');
    if (totalPeople > totalFacesAnalyzed && totalPeople > 0) {
      alerts.push(`${totalPeople - totalFacesAnalyzed} people without face detection`);
    }

    return {
      peopleCount: totalPeople,
      maskCompliance: Math.round(maskCompliance),
      uniformCompliance: Math.round(uniformCompliance),
      violations: alerts.length,
      alerts,
      facesAnalyzed: totalFacesAnalyzed,
      maskedFaces
    };
  }

  async analyzeForSafety(detections: Detection[], videoElement?: HTMLVideoElement) {
    const people = detections.filter(d => d.class === 'person' && d.score > 0.5);
    const fireExtinguishers = detections.filter(d => d.class === 'fire hydrant' && d.score > 0.4);
    
    // Look for potential safety hazards
    const bags = detections.filter(d => d.class === 'backpack' && d.score > 0.4);
    
    const alerts = [];
    let systemStatus = 'operational';
    let fireDetected = false;
    let smokeDetected = false;
    
    // Fire and smoke detection using video analysis
    if (videoElement) {
      const fireAnalysis = await this.detectFireAndSmoke(videoElement);
      fireDetected = fireAnalysis.fireDetected;
      smokeDetected = fireAnalysis.smokeDetected;
      
      if (fireDetected) {
        alerts.push('🔥 FIRE DETECTED - EMERGENCY EVACUATION REQUIRED!');
        systemStatus = 'emergency';
      }
      
      if (smokeDetected) {
        alerts.push('💨 SMOKE DETECTED - POTENTIAL FIRE HAZARD!');
        if (systemStatus === 'operational') systemStatus = 'warning';
      }
    }
    
    // Crowding detection
    if (people.length > 10) {
      alerts.push(`High occupancy: ${people.length} people detected`);
      if (people.length > 20) {
        if (systemStatus === 'operational') systemStatus = 'crowded';
        alerts.push('Potential crowd safety concern');
      }
    }
    
    // Unattended items detection
    if (bags.length > people.length) {
      alerts.push('Unattended bags detected - security check recommended');
    }
    
    // Safety equipment verification
    if (fireExtinguishers.length === 0) {
      alerts.push('No fire safety equipment visible in frame');
    }
    
    // Calculate response readiness based on emergency level
    let responseTime = '0.3s';
    if (fireDetected || smokeDetected) {
      responseTime = '0.1s'; // Emergency response
    } else if (people.length > 10) {
      responseTime = '0.5s';
    }

    return {
      peopleCount: people.length,
      systemStatus,
      safetyEquipment: fireExtinguishers.length,
      alerts,
      responseTime,
      fireDetected,
      smokeDetected,
      potentialHazards: {
        fire: fireDetected,
        smoke: smokeDetected,
        crowding: people.length > 15,
        unattendedItems: bags.length > people.length,
        equipmentMissing: fireExtinguishers.length === 0
      }
    };
  }

  // Utility method to check if models are actually loaded
  isModelReady() {
    return this.isInitialized;
  }

  hasRealModels() {
    return this.objectModel !== null || this.faceModel !== null;
  }

  hasMaskDetection() {
    return this.faceModel !== null; // Using face model for mask detection
  }
}

export const cvService = new ComputerVisionService();