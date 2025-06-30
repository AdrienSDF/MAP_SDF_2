import React, { useEffect } from 'react';
import NetworkCanvas from './components/NetworkCanvas';
import Toolbar from './components/Toolbar';
import FlowToggles from './components/FlowToggles';
import Legend from './components/Legend';
import { useNetworkData } from './hooks/useNetworkData';
import { useViewState } from './hooks/useViewState';

function App() {
  const {
    data,
    addMachine,
    updateMachine,
    deleteMachine,
    addConnection,
    deleteConnection,
    toggleFlow,
    exportData
  } = useNetworkData();

  const {
    viewState,
    legendExpanded,
    updateViewState,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    toggleLegend
  } = useViewState();

  // Fit to screen on initial load
  useEffect(() => {
    if (data.machines.length > 0) {
      setTimeout(() => fitToScreen(data.machines), 100);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 overflow-hidden">
      <NetworkCanvas
        machines={data.machines}
        connections={data.connections}
        flows={data.flows}
        viewState={viewState}
        onUpdateViewState={updateViewState}
        onUpdateMachine={updateMachine}
        onDeleteMachine={deleteMachine}
        onAddConnection={addConnection}
        onDeleteConnection={deleteConnection}
      />
      
      <Toolbar
        onAddMachine={addMachine}
        onExport={exportData}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToScreen={() => fitToScreen(data.machines)}
        zoom={viewState.zoom}
      />
      
      <FlowToggles
        flows={data.flows}
        onToggleFlow={toggleFlow}
      />
      
      <Legend
        expanded={legendExpanded}
        onToggle={toggleLegend}
      />
    </div>
  );
}

export default App;