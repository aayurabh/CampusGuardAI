import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { MonitoringModule } from '../App';

interface Module {
  id: MonitoringModule;
  title: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

interface ModuleSelectorProps {
  modules: Module[];
  activeModule: MonitoringModule;
  onModuleChange: (module: MonitoringModule) => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  activeModule,
  onModuleChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monitoring Modules</h3>
      <div className="space-y-2">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onModuleChange(module.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              activeModule === module.id
                ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${module.color}`}>
                <module.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{module.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{module.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelector;