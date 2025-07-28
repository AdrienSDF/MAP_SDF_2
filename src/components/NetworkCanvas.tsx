import React, { useRef, useState, useEffect } from 'react';
import { Machine, Connection, MachineGroup } from '../types';
import MachineElement from './MachineElement';
import GroupElement from './GroupElement';
import ConnectionLine from './ConnectionLine';

interface NetworkCanvasProps {
  machines: Machine[];
  connections: Connection[];
  groups: MachineGroup[];
  flows: any[];
  viewState: any;
  onUpdateViewState: (updates: any) => void;
  onUpdateMachine: (id: string, updates: Partial<Machine>) => void;
  onUpdateGroup: (id: string, updates: Partial<MachineGroup>) => void;
  onUpdateGroupPosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateGroupSize: (id: string, size: { width: number; height: number }) => void;
  onDeleteMachine: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onAddConnection: (connection: Omit<Connection, 'id'>) => void;
  onDeleteConnection: (id: string) => void;
}

const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  machines,
  connections,
  groups,
  flows,
  viewState,
  onUpdateViewState,
  onUpdateMachine,
  onUpdateGroup,
  onUpdateGroupPosition,
  onUpdateGroupSize,
  onDeleteMachine,
  onDeleteGroup,
  onAddConnection,
  onDeleteConnection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

  // Grid pattern
  const gridSize = 20;
  const gridOffset = {
    x: (viewState.pan.x * viewState.zoom) % gridSize,
    y: (viewState.pan.y * viewState.zoom) % gridSize
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning if clicking on the canvas background
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.grid-background')) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setLastPanPosition({ x: viewState.pan.x, y: viewState.pan.y });
      
      // Change cursor to grabbing
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      onUpdateViewState({
        pan: {
          x: lastPanPosition.x + deltaX,
          y: lastPanPosition.y + deltaY
        }
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      
      // Reset cursor
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Get mouse position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, viewState.zoom * delta));
    
    // Calculate new pan to zoom towards mouse position
    const zoomFactor = newZoom / viewState.zoom;
    const newPanX = mouseX - (mouseX - viewState.pan.x) * zoomFactor;
    const newPanY = mouseY - (mouseY - viewState.pan.y) * zoomFactor;
    
    onUpdateViewState({ 
      zoom: newZoom,
      pan: { x: newPanX, y: newPanY }
    });
  };

  const handleConnectionStart = (machineId: string) => {
    onUpdateViewState({
      isConnecting: true,
      connectionStart: machineId
    });
  };

  const handleConnectionEnd = (machineId: string) => {
    if (viewState.connectionStart && viewState.connectionStart !== machineId) {
      onAddConnection({
        from: viewState.connectionStart,
        to: machineId,
        type: 'internal',
        style: 'solid'
      });
    }
    
    onUpdateViewState({
      isConnecting: false,
      connectionStart: null
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        onUpdateViewState({ zoom: Math.min(viewState.zoom * 1.2, 3) });
      } else if (e.key === '-') {
        e.preventDefault();
        onUpdateViewState({ zoom: Math.max(viewState.zoom / 1.2, 0.3) });
      } else if (e.key === '0') {
        e.preventDefault();
        onUpdateViewState({ zoom: 1, pan: { x: 0, y: 0 } });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState.zoom, onUpdateViewState]);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart, lastPanPosition]);

  // Handle middle mouse button panning
  useEffect(() => {
    const handleMiddleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        setLastPanPosition({ x: viewState.pan.x, y: viewState.pan.y });
      }
    };

    const handleMiddleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMiddleMouseDown);
      canvas.addEventListener('mouseup', handleMiddleMouseUp);
      
      return () => {
        canvas.removeEventListener('mousedown', handleMiddleMouseDown);
        canvas.removeEventListener('mouseup', handleMiddleMouseUp);
      };
    }
  }, [viewState.pan]);

  return (
    <div
      ref={canvasRef}
      className="w-full h-screen bg-gray-900 overflow-hidden relative cursor-grab"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10 grid-background pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #374151 1px, transparent 1px),
            linear-gradient(to bottom, #374151 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${gridOffset.x}px ${gridOffset.y}px`
        }}
      />

      {/* Main Content Container */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${viewState.pan.x}px, ${viewState.pan.y}px)`
        }}
      >
        {/* SVG for Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              machines={machines}
              flows={flows}
              zoom={viewState.zoom}
              onDelete={onDeleteConnection}
            />
          ))}
        </svg>

        {/* Groups */}
        {groups.map(group => (
          <GroupElement
            key={group.id}
            group={group}
            isSelected={viewState.selectedMachine === group.id}
            zoom={viewState.zoom}
            pan={viewState.pan}
            onSelect={(id) => onUpdateViewState({ selectedMachine: id })}
            onUpdatePosition={onUpdateGroupPosition}
            onUpdateSize={onUpdateGroupSize}
            onUpdate={onUpdateGroup}
            onDelete={onDeleteGroup}
          />
        ))}

        {/* Machines */}
        {machines.map(machine => (
          <MachineElement
            key={machine.id}
            machine={machine}
            groups={groups}
            isSelected={viewState.selectedMachine === machine.id}
            zoom={viewState.zoom}
            pan={viewState.pan}
            onSelect={(id) => onUpdateViewState({ selectedMachine: id })}
            onUpdatePosition={(id, position) => onUpdateMachine(id, { position })}
            onUpdate={onUpdateMachine}
            onDelete={onDeleteMachine}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            isConnecting={viewState.isConnecting}
          />
        ))}
      </div>

      {/* Connection Mode Indicator */}
      {viewState.isConnecting && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Click on another machine to create connection
        </div>
      )}

      {/* Pan Instructions */}
      <div className="absolute bottom-20 left-4 text-gray-400 text-xs bg-gray-800 bg-opacity-75 px-2 py-1 rounded">
        Click and drag to pan • Middle-click drag • Scroll to zoom
      </div>
    </div>
  );
};

export default NetworkCanvas;