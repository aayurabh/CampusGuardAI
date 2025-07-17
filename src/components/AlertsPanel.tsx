import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { MonitoringModule } from '../App';

interface AlertsPanelProps {
  moduleId: MonitoringModule;
  realTimeData?: any;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ moduleId, realTimeData }) => {
  // Use real-time alerts if available, otherwise fall back to mock data
  const getRealTimeAlerts = () => {
    if (realTimeData?.alerts && realTimeData.alerts.length > 0) {
      return realTimeData.alerts.map((alert: string, index: number) => ({
        id: index + 1,
        type: 'warning',
        message: alert,
        time: 'Just now'
      }));
    }
    return [];
  };

  const getModuleAlerts = () => {
    switch (moduleId) {
      case 'classroom-behavior':
        return [
          { id: 1, type: 'warning', message: 'Possible disruption detected in row 3', time: '2m ago' },
          { id: 2, type: 'info', message: 'Attention level decreased by 10%', time: '5m ago' }
        ];
      case 'exam-supervision':
        return [
          { id: 1, type: 'warning', message: 'Suspicious object detected on desk 15', time: '1m ago' },
          { id: 2, type: 'success', message: 'All candidates following gaze protocol', time: '3m ago' }
        ];
      case 'occupancy-monitoring':
        return [
          { id: 1, type: 'info', message: 'Occupancy approaching 80% capacity', time: '4m ago' },
          { id: 2, type: 'success', message: 'Peak hours analysis complete', time: '10m ago' }
        ];
      case 'compliance-check':
        return [
          { id: 1, type: 'warning', message: 'Mask compliance violation detected', time: '1m ago' },
          { id: 2, type: 'warning', message: 'Uniform policy violation in Lab 2', time: '3m ago' }
        ];
      case 'safety-detection':
        return [
          { id: 1, type: 'success', message: 'All safety systems operational', time: '5m ago' },
          { id: 2, type: 'info', message: 'Scheduled safety check completed', time: '15m ago' }
        ];
      default:
        return [];
    }
  };

  const realTimeAlerts = getRealTimeAlerts();
  const mockAlerts = getModuleAlerts();
  const alerts = realTimeAlerts.length > 0 ? realTimeAlerts : mockAlerts;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBorder = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500';
      case 'success':
        return 'border-l-green-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
        <span className="text-sm text-gray-500">{alerts.length} alerts</span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No active alerts</p>
            <p className="text-sm text-gray-400">System is operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 bg-gray-50 rounded-lg border-l-4 ${getAlertBorder(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;