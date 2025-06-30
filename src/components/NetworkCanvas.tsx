import React, { useRef, useState, useEffect } from 'react';
import { Machine, Connection } from '../types';
import MachineElement from './MachineElement';
import ConnectionLine from './ConnectionLine';

interface NetworkCanvasProps {
  machines: Machine[];
  connections: Connection[];
  flows: any[];
  viewState: any;
  onUpdateViewState: (updates: any) => void;
  onUpdateMachine: (id: string, updates: Partial<Machine>) => void;
  onDeleteMachine: (id: string) => void;
  onAddConnection: (connection: Omit<Connection, 'id'>) => void;
  onDeleteConnection: (id: string) => void;
}

const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  machines,
  connections,
  flows,
  viewState,
  onUpdateViewState,
  onUpdateMachine,
  onDeleteMachine,
  onAddConnection,
  onDeleteConnection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Grid pattern
  const gridSize = 20;
  const gridOffset = {
    x: (viewState.pan.x * viewState.zoom) % gridSize,
    y: (viewState.pan.y * viewState.zoom) % gridSize
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewState.pan.x, y: e.clientY - viewState.pan.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      onUpdateViewState({
        pan: {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, viewState.zoom * delta));
    
    onUpdateViewState({ zoom: newZoom });
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
        onUpdateViewState({ zoom: Math.min(viewState.zoom * 1.2, 3) });
      } else if (e.key === '-') {
        onUpdateViewState({ zoom: Math.max(viewState.zoom / 1.2, 0.3) });
      } else if (e.key === '0') {
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
  }, [isPanning, panStart]);

  return (
    <div
      ref={canvasRef}
      className="w-full h-screen bg-gray-900 overflow-hidden relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
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

        {/* Machines */}
        {machines.map(machine => (
          <MachineElement
            key={machine.id}
            machine={machine}
            isSelected={viewState.selectedMachine === machine.id}
            zoom={viewState.zoom}
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
    </div>
  );
};

export default NetworkCanvas;