import React, { useState } from 'react';
import { Plus, Download, RotateCcw, ZoomIn, ZoomOut, Maximize2, Users } from 'lucide-react';
import { Machine, MachineGroup } from '../types';

interface ToolbarProps {
  onAddMachine: (machine: Omit<Machine, 'id'>) => void;
  onAddGroup: (group: Omit<MachineGroup, 'id'>) => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddMachine,
  onAddGroup,
  onExport,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  zoom
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [formData, setFormData] = useState({
    hostname: '',
    privateIP: '',
    type: 'vm' as Machine['type'],
    environment: 'aws' as Machine['environment']
  });

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    color: '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.hostname && formData.privateIP) {
      onAddMachine({
        ...formData,
        position: { x: 100, y: 100 }
      });
      setFormData({
        hostname: '',
        privateIP: '',
        type: 'vm',
        environment: 'aws'
      });
      setShowAddForm(false);
    }
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupFormData.name) {
      onAddGroup({
        ...groupFormData,
        position: { x: 50, y: 50 },
        size: { width: 300, height: 200 }
      });
      setGroupFormData({
        name: '',
        color: '#3B82F6'
      });
      setShowGroupForm(false);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 bg-gray-800 rounded-lg shadow-lg p-3 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            title="Add Machine"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>
          
          <button
            onClick={() => setShowGroupForm(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            title="Create Group"
          >
            <Users className="w-4 h-4" />
            Create Group
          </button>
          
          <div className="w-px h-6 bg-gray-600" />
          
          <button
            onClick={onExport}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Export Configuration"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-3 z-50">
        <div className="flex flex-col gap-2">
          <button
            onClick={onZoomIn}
            className="p-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="text-center text-xs text-gray-400 px-2">
            {Math.round(zoom * 100)}%
          </div>
          
          <button
            onClick={onZoomOut}
            className="p-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="w-full h-px bg-gray-600 my-1" />
          
          <button
            onClick={onResetZoom}
            className="p-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Reset Zoom (0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={onFitToScreen}
            className="p-2 text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Machine Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Machine</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hostname
                </label>
                <input
                  type="text"
                  value={formData.hostname}
                  onChange={(e) => setFormData(prev => ({ ...prev, hostname: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., web-server-01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Private IP
                </label>
                <input
                  type="text"
                  value={formData.privateIP}
                  onChange={(e) => setFormData(prev => ({ ...prev, privateIP: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10.0.1.10"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Machine Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Machine['type'] }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vm">Virtual Machine</option>
                  <option value="physical">Physical Server</option>
                  <option value="cloud">Cloud Instance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Environment
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value as Machine['environment'] }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aws">AWS</option>
                  <option value="ovh">OVH</option>
                  <option value="onprem">On-Premises</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Add Machine
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
      {/* Add Group Modal */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Group</h3>
            
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Web Servers, Database Cluster"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Group Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={groupFormData.color}
                    onChange={(e) => setGroupFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={groupFormData.color}
                    onChange={(e) => setGroupFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  );
};

export default Toolbar;