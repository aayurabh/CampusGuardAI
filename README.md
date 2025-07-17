# CampusGuard: AI-Powered Campus Monitoring Toolkit

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://fanciful-profiterole-7fd828.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-orange)](https://www.tensorflow.org/js)

## 🎯 Overview

CampusGuard is a comprehensive AI-powered computer vision toolkit designed to enhance safety, discipline, and operational efficiency within educational campuses. Built with modern web technologies and lightweight AI models, it provides real-time monitoring capabilities through webcam feeds with a modular, scalable architecture.

## ✨ Features

### 🏫 **Monitoring Modules**
- **Classroom Behavior Monitoring** - Track student attention, detect disruptions, and monitor engagement levels
- **Exam Supervision** - Automated proctoring with gaze tracking and unauthorized object detection
- **Occupancy Tracking** - Real-time space utilization monitoring for libraries and study areas
- **Compliance Checking** - Mask and uniform compliance verification in labs and examination halls
- **Safety Detection** - Fire, smoke, and emergency situation monitoring
- **System Overview** - Centralized dashboard with analytics and system status

### 🤖 **AI Capabilities**
- **Real-time Object Detection** - 80+ object classes using COCO-SSD model
- **Face Detection & Tracking** - Advanced facial recognition with landmark detection
- **Person Counting** - Accurate occupancy monitoring and crowd analysis
- **Behavioral Analysis** - Attention level assessment and distraction detection
- **Smart Alerts** - Context-aware notifications and violation reporting

### 💻 **Technical Features**
- **Responsive Design** - Optimized for desktop monitoring stations and mobile devices
- **Real-time Processing** - Live webcam feed analysis with 15-30 FPS performance
- **Modular Architecture** - Easily extensible with new monitoring modules
- **Fallback System** - Graceful degradation with demo mode when AI models unavailable
- **Professional UI** - Clean, institutional design with accessibility features

## 🚀 Live Demo

**[Try CampusGuard Live](https://fanciful-profiterole-7fd828.netlify.app)**

*Note: Camera permissions required for full functionality*

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - Modern UI framework with hooks
- **TypeScript 5.5.3** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Vite 5.4.2** - Fast build tool and dev server

### **AI & Computer Vision**
- **TensorFlow.js 4.22.0** - Machine learning in the browser
- **COCO-SSD** - Object detection model
- **BlazeFace** - Face detection and landmark tracking
- **MediaPipe** - Real-time perception pipeline
- **MobileNet** - Lightweight neural network architecture

### **Icons & UI**
- **Lucide React** - Beautiful, customizable icons
- **Custom Components** - Modular, reusable UI elements

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser with webcam support

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/campusguard.git
cd campusguard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Usage

### Getting Started
1. **Launch Application** - Open in browser and grant camera permissions
2. **Select Module** - Choose from 6 monitoring modules in the sidebar
3. **Start Monitoring** - Click "Start Monitoring" to begin real-time analysis
4. **View Analytics** - Monitor live statistics and alerts in real-time
5. **Configure Settings** - Adjust detection sensitivity and alert thresholds

### Module Guide

#### 🎓 **Classroom Monitoring**
- Tracks student count and attention levels
- Detects mobile phone usage and distractions
- Monitors engagement with learning materials
- Provides attention analytics and disruption alerts

#### 📝 **Exam Supervision**
- Monitors candidate behavior and gaze patterns
- Detects unauthorized objects (phones, books, notes)
- Tracks compliance with examination protocols
- Generates violation reports and alerts

#### 👥 **Occupancy Tracking**
- Real-time people counting and capacity monitoring
- Space utilization analytics for libraries and study areas
- Available seat tracking and peak usage analysis
- Occupancy rate visualization and alerts

#### ✅ **Compliance Checking**
- Mask compliance verification (extensible for custom models)
- Uniform policy enforcement monitoring
- Violation detection and reporting
- Compliance rate analytics and trends

#### 🔥 **Safety Detection**
- Environmental hazard monitoring
- Emergency situation detection
- Safety equipment verification
- Rapid response alert system

## ⚙️ Configuration

### Detection Settings
```javascript
// Adjust in Settings Panel
{
  sensitivity: 75,           // Detection sensitivity (0-100)
  confidenceThreshold: 80,   // Minimum confidence for detections
  frameRate: 30,            // Processing frame rate
  alertThreshold: 'medium'   // Alert sensitivity level
}
```

### Camera Settings
```javascript
// Webcam configuration
{
  resolution: '1080p',       // Video resolution
  frameRate: 30,            // Camera frame rate
  facingMode: 'user'        // Camera direction
}
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Dashboard.tsx          # Main overview dashboard
│   ├── ModuleSelector.tsx     # Module navigation
│   ├── CameraFeed.tsx         # Video feed management
│   ├── RealCameraFeed.tsx     # Live CV processing
│   ├── AlertsPanel.tsx        # Alert management
│   ├── AnalyticsPanel.tsx     # Statistics display
│   └── SettingsPanel.tsx      # Configuration UI
├── hooks/
│   └── useWebcam.ts          # Webcam management hook
├── services/
│   └── cvService.ts          # Computer vision service
└── types/
    └── index.ts              # TypeScript definitions
```

### AI Model Pipeline
1. **Video Capture** - Webcam stream acquisition
2. **Frame Processing** - Real-time frame analysis
3. **Object Detection** - COCO-SSD model inference
4. **Face Detection** - BlazeFace model processing
5. **Analysis Engine** - Module-specific interpretation
6. **Alert Generation** - Smart notification system
7. **Analytics Update** - Real-time dashboard updates

## 🔧 Development

### Adding New Modules
```typescript
// 1. Define module type
export type MonitoringModule = 'your-module' | ...;

// 2. Add module configuration
const modules = [
  {
    id: 'your-module',
    title: 'Your Module',
    icon: YourIcon,
    description: 'Module description',
    color: 'bg-your-color'
  }
];

// 3. Implement analysis function
analyzeForYourModule(detections: Detection[], faces: FaceDetection[]) {
  // Your analysis logic
  return { alerts: [], metrics: {} };
}
```

### Custom Model Integration
```typescript
// Add to cvService.ts
private async loadCustomModel() {
  this.customModel = await tf.loadLayersModel('/models/your-model.json');
}

async detectCustomObjects(videoElement: HTMLVideoElement) {
  const predictions = await this.customModel.predict(videoElement);
  return this.processCustomPredictions(predictions);
}
```

## 🚀 Deployment

### Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload dist/ folder to Netlify dashboard
# Or use Netlify CLI
netlify deploy --prod --dir=dist
```

### Other Platforms
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Configure with GitHub Actions
- **AWS S3**: Upload build files to S3 bucket
- **Docker**: Use provided Dockerfile

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js Team** - For providing excellent web-based ML tools
- **MediaPipe** - For advanced perception capabilities
- **React Community** - For the robust frontend framework
- **Tailwind CSS** - For the utility-first styling approach

## 📞 Support

- **Documentation**: [Wiki](https://github.com/aayurabh/CampusGuardAI/wiki)
- **Issues**: [GitHub Issues](https://github.com/aayurabh/CampusGuardAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aayurabh/CampusGuardAI/discussions)

## 🔮 Roadmap

- [ ] **Advanced Analytics** - Historical data visualization and reporting
- [ ] **Multi-Camera Support** - Simultaneous monitoring of multiple feeds
- [ ] **Cloud Integration** - Remote monitoring and data storage
- [ ] **Mobile App** - Native mobile application for administrators
- [ ] **Custom Model Training** - Tools for training institution-specific models
- [ ] **API Integration** - RESTful API for third-party integrations
- [ ] **Advanced Alerts** - Email, SMS, and webhook notifications
- [ ] **User Management** - Role-based access control and permissions

---

**Made with ❤️ for educational institutions worldwide**

*CampusGuard - Enhancing campus safety through intelligent monitoring*
