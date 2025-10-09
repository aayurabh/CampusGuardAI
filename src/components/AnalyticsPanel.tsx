import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { MonitoringModule } from '../App';

interface AnalyticsPanelProps {
  moduleId: MonitoringModule;
  realTimeData?: unknown;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ moduleId, realTimeData }) => {
  // Use real-time data if available, otherwise fall back to mock data
  const getRealTimeMetrics = () => {
    if (!realTimeData) return null;

    switch (moduleId) {
      case 'classroom-behavior':
        return {
          title: 'Live Classroom Analytics',
          metrics: [
            { label: 'Students Detected', value: realTimeData.studentCount?.toString() || '0', change: '+0', trend: 'up' },
            { label: 'Attention Level', value: `${realTimeData.attentionLevel || 0}%`, change: '+0%', trend: 'up' },
            { label: 'Distractions', value: realTimeData.distractions?.toString() || '0', change: '0', trend: 'down' }
          ]
        };
      case 'exam-supervision':
        return {
          title: 'Live Exam Analytics',
          metrics: [
            { label: 'Candidates', value: realTimeData.candidateCount?.toString() || '0', change: '+0', trend: 'up' },
            { label: 'Gaze Compliance', value: `${Math.round(realTimeData.gazeCompliance || 0)}%`, change: '+0%', trend: 'up' },
            { label: 'Violations', value: realTimeData.violations?.toString() || '0', change: '0', trend: 'down' }
          ]
        };
      case 'occupancy-monitoring':
        return {
          title: 'Live Occupancy Analytics',
          metrics: [
            { label: 'Current Occupancy', value: `${realTimeData.occupancyRate || 0}%`, change: '+0%', trend: 'up' },
            { label: 'People Count', value: realTimeData.currentOccupancy?.toString() || '0', change: '+0', trend: 'up' },
            { label: 'Available Seats', value: realTimeData.availableSeats?.toString() || '0', change: '0', trend: 'up' }
          ]
        };
      case 'compliance-check':
        return {
          title: 'Live Compliance Analytics',
          metrics: [
            { label: 'People Detected', value: realTimeData.peopleCount?.toString() || '0', change: '+0', trend: 'up' },
            { label: 'Mask Compliance', value: `${realTimeData.maskCompliance || 0}%`, change: '+0%', trend: 'up' },
            { label: 'Violations', value: realTimeData.violations?.toString() || '0', change: '0', trend: 'down' }
          ]
        };
      case 'safety-detection':
        return {
          title: 'Live Safety Analytics',
          metrics: [
            { label: 'People Count', value: realTimeData.peopleCount?.toString() || '0', change: '+0', trend: 'up' },
            { label: 'System Status', value: realTimeData.systemStatus || 'Unknown', change: '', trend: 'up' },
            { label: 'Response Time', value: realTimeData.responseTime || '0s', change: '', trend: 'down' }
          ]
        };
      default:
        return null;
    }
  };
  const getModuleAnalytics = () => {
    switch (moduleId) {
      case 'classroom-behavior':
        return {
          title: 'Classroom Analytics',
          metrics: [
            { label: 'Average Attention', value: '87%', change: '+5%', trend: 'up' },
            { label: 'Participation Rate', value: '73%', change: '+2%', trend: 'up' },
            { label: 'Disruption Events', value: '2', change: '-1', trend: 'down' }
          ]
        };
      case 'exam-supervision':
        return {
          title: 'Exam Analytics',
          metrics: [
            { label: 'Compliance Rate', value: '98%', change: '+1%', trend: 'up' },
            { label: 'Violations Detected', value: '1', change: '-2', trend: 'down' },
            { label: 'Average Gaze Focus', value: '92%', change: '+3%', trend: 'up' }
          ]
        };
      case 'occupancy-monitoring':
        return {
          title: 'Occupancy Analytics',
          metrics: [
            { label: 'Current Occupancy', value: '78%', change: '+12%', trend: 'up' },
            { label: 'Peak Today', value: '94%', change: '+5%', trend: 'up' },
            { label: 'Avg. Duration', value: '2.3h', change: '+0.2h', trend: 'up' }
          ]
        };
      case 'compliance-check':
        return {
          title: 'Compliance Analytics',
          metrics: [
            { label: 'Mask Compliance', value: '94%', change: '-2%', trend: 'down' },
            { label: 'Uniform Compliance', value: '98%', change: '+1%', trend: 'up' },
            { label: 'Total Violations', value: '3', change: '+1', trend: 'up' }
          ]
        };
      case 'safety-detection':
        return {
          title: 'Safety Analytics',
          metrics: [
            { label: 'System Uptime', value: '99.8%', change: '+0.1%', trend: 'up' },
            { label: 'False Alarms', value: '0', change: '-1', trend: 'down' },
            { label: 'Response Time', value: '0.3s', change: '-0.1s', trend: 'down' }
          ]
        };
      default:
        return {
          title: 'Analytics',
          metrics: []
        };
    }
  };

  const realTimeMetrics = getRealTimeMetrics();
  const analytics = realTimeMetrics || getModuleAnalytics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{analytics.title}</h3>
        <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>

      <div className="space-y-4">
        {analytics.metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.change}
              </span>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mini Chart Placeholder */}
      <div className="mt-6 h-20 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Activity className="w-4 h-4" />
          <span className="text-sm">Real-time analytics chart</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;