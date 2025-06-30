import React from 'react';
import { ChevronDown, Server, HardDrive, Cloud } from 'lucide-react';

interface LegendProps {
  expanded: boolean;
  onToggle: () => void;
}

const Legend: React.FC<LegendProps> = ({ expanded, onToggle }) => {
  const machineTypes = [
    { type: 'vm', icon: Server, label: 'Virtual Machine', color: '#3B82F6' },
    { type: 'physical', icon: HardDrive, label: 'Physical Server', color: '#8B5CF6' },
    { type: 'cloud', icon: Cloud, label: 'Cloud Instance', color: '#10B981' }
  ];

  const connectionTypes = [
    { type: 'solid', label: 'Direct Connection', style: 'border-solid' },
    { type: 'dashed', label: 'VPN Connection', style: 'border-dashed' },
    { type: 'dotted', label: 'Indirect Connection', style: 'border-dotted' }
  ];

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 rounded-lg shadow-lg z-40 overflow-hidden transition-all duration-300 ease-in-out">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-white hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium">Legend</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Machine Types</h4>
            <div className="space-y-2">
              {machineTypes.map(({ type, icon: Icon, label, color }) => (
                <div key={type} className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Connection Types</h4>
            <div className="space-y-2">
              {connectionTypes.map(({ type, label, style }) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-6 h-0 border-2 border-gray-400 ${style}`} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Environments</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-xs text-gray-400">AWS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-xs text-gray-400">OVH</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-xs text-gray-400">On-Premises</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;