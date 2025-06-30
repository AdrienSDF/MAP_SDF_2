import React from 'react';
import { Connection, Machine } from '../types';

interface ConnectionLineProps {
  connection: Connection;
  machines: Machine[];
  flows: any[];
  zoom: number;
  onDelete: (id: string) => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  machines,
  flows,
  zoom,
  onDelete
}) => {
  const fromMachine = machines.find(m => m.id === connection.from);
  const toMachine = machines.find(m => m.id === connection.to);
  
  if (!fromMachine || !toMachine) return null;

  const activeFlow = flows.find(f => f.id === connection.type);
  if (!activeFlow?.enabled) return null;

  // Calculate connection points (center of machines)
  const fromX = fromMachine.position.x + 80; // Half of machine width
  const fromY = fromMachine.position.y + 50;
  const toX = toMachine.position.x + 80;
  const toY = toMachine.position.y + 50;

  // Create curved path
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const controlOffset = 50;
  
  const path = `M ${fromX} ${fromY} Q ${midX} ${midY - controlOffset} ${toX} ${toY}`;

  const getStrokeStyle = () => {
    switch (connection.style) {
      case 'dashed': return '10,5';
      case 'dotted': return '2,2';
      default: return 'none';
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this connection?')) {
      onDelete(connection.id);
    }
  };

  return (
    <g>
      <path
        d={path}
        stroke={activeFlow.color}
        strokeWidth={2 / zoom}
        strokeDasharray={getStrokeStyle()}
        fill="none"
        className="cursor-pointer hover:stroke-width-4 transition-all"
        onContextMenu={handleRightClick}
        title={`${connection.type} connection (right-click to delete)`}
      />
    </g>
  );
};

export default ConnectionLine;