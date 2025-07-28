import React, { useState, useRef } from 'react';
import { Server, HardDrive, Cloud, Edit2, Trash2, Circle } from 'lucide-react';
import { Machine } from '../types';

interface MachineElementProps {
  machine: Machine;
  groups: any[];
  isSelected: boolean;
  zoom: number;
  pan: { x: number; y: number };
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
  onUpdate: (id: string, updates: Partial<Machine>) => void;
  onDelete: (id: string) => void;
  onConnectionStart: (id: string) => void;
  onConnectionEnd: (id: string) => void;
  isConnecting: boolean;
}

const MachineElement: React.FC<MachineElementProps> = ({
  machine,
  groups,
  isSelected,
  zoom,
  pan,
  onSelect,
  onUpdatePosition,
  onUpdate,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  isConnecting
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    hostname: machine.hostname,
    privateIP: machine.privateIP,
    groupId: machine.groupId || ''
  });
  const dragOffset = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const getIcon = () => {
    switch (machine.type) {
      case 'vm': return Server;
      case 'physical': return HardDrive;
      case 'cloud': return Cloud;
      default: return Server;
    }
  };

  const getTypeColor = () => {
    switch (machine.type) {
      case 'vm': return '#3B82F6';
      case 'physical': return '#8B5CF6';
      case 'cloud': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getEnvironmentColor = () => {
    switch (machine.environment) {
      case 'aws': return '#FF6B35';
      case 'ovh': return '#0066CC';
      case 'onprem': return '#059669';
      default: return '#6B7280';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    onSelect(machine.id);
    
    // Calculate the offset from the mouse position to the element's position
    // Account for zoom and pan transformations
    const mouseX = (e.clientX - pan.x) / zoom;
    const mouseY = (e.clientY - pan.y) / zoom;
    
    dragOffset.current = {
      x: mouseX - machine.position.x,
      y: mouseY - machine.position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate new position accounting for zoom, pan, and initial offset
    const mouseX = (e.clientX - pan.x) / zoom;
    const mouseY = (e.clientY - pan.y) / zoom;
    
    const newX = mouseX - dragOffset.current.x;
    const newY = mouseY - dragOffset.current.y;
    
    onUpdatePosition(machine.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, zoom, pan]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updates = {
      hostname: editData.hostname,
      privateIP: editData.privateIP,
      groupId: editData.groupId || undefined
    };
    onUpdate(machine.id, updates);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      hostname: machine.hostname,
      privateIP: machine.privateIP,
      groupId: machine.groupId || ''
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete ${machine.hostname}?`)) {
      onDelete(machine.id);
    }
  };

  const handleConnectionPointClick = (e: React.MouseEvent, position: 'top' | 'bottom') => {
    e.stopPropagation();
    if (isConnecting) {
      onConnectionEnd(machine.id);
    } else {
      onConnectionStart(machine.id);
    }
  };

  const Icon = getIcon();

  return (
    <div
      ref={elementRef}
      className={`absolute select-none cursor-move group ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: machine.position.x,
        top: machine.position.y,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Connection Points */}
      <div
        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-400 cursor-pointer hover:bg-blue-500 transition-colors z-30"
        onClick={(e) => handleConnectionPointClick(e, 'top')}
        title="Connection point"
      >
        <Circle className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-400 cursor-pointer hover:bg-blue-500 transition-colors z-30"
        onClick={(e) => handleConnectionPointClick(e, 'bottom')}
        title="Connection point"
      >
        <Circle className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Machine Card */}
      <div 
        className={`bg-gray-800 rounded-lg shadow-lg border-2 min-w-40 ${
          isSelected ? 'border-blue-500' : 'border-gray-600'
        } transition-all hover:shadow-xl`}
        style={{
          borderLeftColor: getEnvironmentColor(),
          borderLeftWidth: '4px'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center gap-2 p-3 rounded-t-lg"
          style={{ backgroundColor: getTypeColor() }}
        >
          <Icon className="w-5 h-5 text-white" />
          {isEditing ? (
            <input
              type="text"
              value={editData.hostname}
              onChange={(e) => setEditData(prev => ({ ...prev, hostname: e.target.value }))}
              className="flex-1 bg-transparent text-white text-sm font-medium border-b border-white/30 focus:outline-none focus:border-white"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-white text-sm font-medium">{machine.hostname}</span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.privateIP}
                onChange={(e) => setEditData(prev => ({ ...prev, privateIP: e.target.value }))}
                className="w-full bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Private IP"
              />
              <select
                value={editData.groupId}
                onChange={(e) => setEditData(prev => ({ ...prev, groupId: e.target.value }))}
                className="w-full bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">No Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-gray-300 text-xs">{machine.privateIP}</div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 capitalize">{machine.environment}</span>
            
            {/* Group indicator */}
            {machine.groupId && !isEditing && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: groups.find(g => g.id === machine.groupId)?.color || '#6B7280' }}
                />
                <span className="text-xs text-gray-500">
                  {groups.find(g => g.id === machine.groupId)?.name || 'Group'}
                </span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 text-green-400 hover:text-green-300"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineElement;