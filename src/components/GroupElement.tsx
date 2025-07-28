import React, { useState, useRef } from 'react';
import { Edit2, Trash2, Users } from 'lucide-react';
import { MachineGroup } from '../types';

interface GroupElementProps {
  group: MachineGroup;
  isSelected: boolean;
  zoom: number;
  pan: { x: number; y: number };
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateSize: (id: string, size: { width: number; height: number }) => void;
  onUpdate: (id: string, updates: Partial<MachineGroup>) => void;
  onDelete: (id: string) => void;
}

const GroupElement: React.FC<GroupElementProps> = ({
  group,
  isSelected,
  zoom,
  pan,
  onSelect,
  onUpdatePosition,
  onUpdateSize,
  onUpdate,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: group.name,
    color: group.color
  });
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    onSelect(group.id);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const mouseX = (e.clientX - pan.x) / zoom;
    const mouseY = (e.clientY - pan.y) / zoom;
    
    dragOffset.current = {
      x: mouseX - group.position.x,
      y: mouseY - group.position.y
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const mouseX = (e.clientX - pan.x) / zoom;
    const mouseY = (e.clientY - pan.y) / zoom;
    
    resizeStart.current = {
      x: mouseX,
      y: mouseY,
      width: group.size.width,
      height: group.size.height
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const mouseX = (e.clientX - pan.x) / zoom;
      const mouseY = (e.clientY - pan.y) / zoom;
      
      const newX = mouseX - dragOffset.current.x;
      const newY = mouseY - dragOffset.current.y;
      
      onUpdatePosition(group.id, { x: newX, y: newY });
    } else if (isResizing) {
      const mouseX = (e.clientX - pan.x) / zoom;
      const mouseY = (e.clientY - pan.y) / zoom;
      
      const deltaX = mouseX - resizeStart.current.x;
      const deltaY = mouseY - resizeStart.current.y;
      
      const newWidth = Math.max(200, resizeStart.current.width + deltaX);
      const newHeight = Math.max(150, resizeStart.current.height + deltaY);
      
      onUpdateSize(group.id, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, zoom, pan]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(group.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      name: group.name,
      color: group.color
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete group "${group.name}"? Machines in this group will be ungrouped.`)) {
      onDelete(group.id);
    }
  };

  return (
    <div
      className={`absolute select-none group ${isSelected ? 'z-10' : 'z-0'}`}
      style={{
        left: group.position.x,
        top: group.position.y,
        width: group.size.width,
        height: group.size.height,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left'
      }}
    >
      {/* Group Background */}
      <div
        className={`w-full h-full rounded-lg border-2 cursor-move ${
          isSelected ? 'border-white' : 'border-gray-500'
        } transition-all`}
        style={{
          backgroundColor: `${group.color}20`,
          borderColor: isSelected ? '#ffffff' : group.color
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Group Header */}
        <div
          className="flex items-center justify-between p-2 rounded-t-lg"
          style={{ backgroundColor: `${group.color}40` }}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: group.color }} />
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-transparent text-white text-sm font-medium border-b border-white/30 focus:outline-none focus:border-white"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-white text-sm font-medium">{group.name}</span>
            )}
          </div>
          
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
                  className="p-1 text-gray-300 hover:text-white"
                  title="Edit Group"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-300 hover:text-red-400"
                  title="Delete Group"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Color picker when editing */}
        {isEditing && (
          <div className="absolute top-8 left-2 flex gap-2 items-center bg-gray-800 p-2 rounded shadow-lg z-50">
            <input
              type="color"
              value={editData.color}
              onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
              className="w-6 h-6 border border-gray-600 rounded cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-gray-300">Color</span>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 rounded-tl cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
        title="Resize group"
      />
    </div>
  );
};

export default GroupElement;