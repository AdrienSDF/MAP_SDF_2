import React from 'react';
import { NetworkFlow } from '../types';

interface FlowTogglesProps {
  flows: NetworkFlow[];
  onToggleFlow: (flowId: string) => void;
}

const FlowToggles: React.FC<FlowTogglesProps> = ({ flows, onToggleFlow }) => {
  return (
    <div className="fixed top-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 z-40 min-w-[200px]">
      <h3 className="text-sm font-semibold text-white mb-3">Network Flows</h3>
      
      <div className="space-y-2">
        {flows.map(flow => (
          <label key={flow.id} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={flow.enabled}
              onChange={() => onToggleFlow(flow.id)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: flow.color }}
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {flow.name}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FlowToggles;