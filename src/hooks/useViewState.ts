import { useState, useCallback } from 'react';
import { ViewState } from '../types';

const LEGEND_STATE_KEY = 'network-topology-legend-expanded';

export const useViewState = () => {
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedMachine: null,
    isConnecting: false,
    connectionStart: null
  });

  const [legendExpanded, setLegendExpanded] = useState(() => {
    const saved = localStorage.getItem(LEGEND_STATE_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  const updateViewState = useCallback((updates: Partial<ViewState>) => {
    setViewState(prev => ({ ...prev, ...updates }));
  }, []);

  const zoomIn = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.3) }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
  }, []);

  const fitToScreen = useCallback((machines: any[]) => {
    if (machines.length === 0) return;
    
    const padding = 100;
    const minX = Math.min(...machines.map(m => m.position.x)) - padding;
    const maxX = Math.max(...machines.map(m => m.position.x)) + padding;
    const minY = Math.min(...machines.map(m => m.position.y)) - padding;
    const maxY = Math.max(...machines.map(m => m.position.y)) + padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const scaleX = window.innerWidth / width;
    const scaleY = window.innerHeight / height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    setViewState(prev => ({
      ...prev,
      zoom: scale,
      pan: {
        x: (window.innerWidth / 2) - (centerX * scale),
        y: (window.innerHeight / 2) - (centerY * scale)
      }
    }));
  }, []);

  const toggleLegend = useCallback(() => {
    const newState = !legendExpanded;
    setLegendExpanded(newState);
    localStorage.setItem(LEGEND_STATE_KEY, JSON.stringify(newState));
  }, [legendExpanded]);

  return {
    viewState,
    legendExpanded,
    updateViewState,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    toggleLegend
  };
};