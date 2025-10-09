import React from 'react';
import { Eye, Activity, Shield, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Active Cameras',
      value: '12',
      change: '+2',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      title: 'Monitored Areas',
      value: '8',
      change: '+1',
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      title: 'Active Alerts',
      value: '3',
      change: '-1',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Compliance Rate',
      value: '94%',
      change: '+2%',
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Mask compliance violation detected in Lab 101',
      time: '2 minutes ago',
      module: 'Compliance Check'
    },
    {
      id: 2,
      type: 'info',
      message: 'Library occupancy at 85% capacity',
      time: '5 minutes ago',
      module: 'Occupancy Monitoring'
    },
    {
      id: 3,
      type: 'success',
      message: 'Exam supervision active in Hall A',
      time: '10 minutes ago',
      module: 'Exam Supervision'
    }
  ];

  const moduleStatus = [
    { name: 'Classroom Monitoring', status: 'active', cameras: 4, alerts: 0 },
    { name: 'Exam Supervision', status: 'active', cameras: 2, alerts: 1 },
    { name: 'Occupancy Tracking', status: 'active', cameras: 3, alerts: 0 },
    { name: 'Compliance Check', status: 'active', cameras: 2, alerts: 2 },
    { name: 'Safety Detection', status: 'inactive', cameras: 1, alerts: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">from last hour</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{alert.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{alert.module}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Status</h3>
          <div className="space-y-3">
            {moduleStatus.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    module.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{module.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <span>{module.cameras} cameras</span>
                  <span className={`${module.alerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {module.alerts} alerts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Performance analytics visualization</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Real-time monitoring data would be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;