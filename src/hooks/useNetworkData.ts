import { useState, useEffect } from 'react';
import { NetworkTopology, Machine, Connection, NetworkFlow, MachineGroup } from '../types';

const STORAGE_KEY = 'network-topology-data';

const defaultData: NetworkTopology = {
  machines: [
    {
      id: '1',
      hostname: 'web-server-01',
      privateIP: '10.0.1.10',
      type: 'cloud',
      position: { x: 200, y: 150 },
      environment: 'aws'
    },
    {
      id: '2',
      hostname: 'db-server-01',
      privateIP: '10.0.1.20',
      type: 'cloud',
      position: { x: 400, y: 150 },
      environment: 'aws'
    },
    {
      id: '3',
      hostname: 'backup-vm-01',
      privateIP: '192.168.1.10',
      type: 'vm',
      position: { x: 600, y: 200 },
      environment: 'ovh'
    },
    {
      id: '4',
      hostname: 'mail-server',
      privateIP: '192.168.1.50',
      type: 'physical',
      position: { x: 300, y: 350 },
      environment: 'onprem'
    }
  ],
  connections: [
    {
      id: 'conn-1',
      from: '1',
      to: '2',
      type: 'internal',
      style: 'solid'
    },
    {
      id: 'conn-2',
      from: '2',
      to: '3',
      type: 'vpn',
      style: 'dashed'
    }
  ],
  flows: [
    { id: 'basic-aws', name: 'Basic AWS', enabled: true, color: '#FF6B35' },
    { id: 'vpn', name: 'VPN Connections', enabled: true, color: '#F7931E' },
    { id: 'internal', name: 'Internal Network', enabled: true, color: '#FFD23F' },
    { id: 'internet', name: 'Internet Access', enabled: false, color: '#06FFA5' }
  ],
  groups: []
};

export const useNetworkData = () => {
  const [data, setData] = useState<NetworkTopology>(defaultData);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
  }, []);

  const saveData = (newData: NetworkTopology) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const addMachine = (machine: Omit<Machine, 'id'>) => {
    const newMachine: Machine = {
      ...machine,
      id: `machine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newData = {
      ...data,
      machines: [...data.machines, newMachine]
    };
    saveData(newData);
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    const newData = {
      ...data,
      machines: data.machines.map(m => m.id === id ? { ...m, ...updates } : m)
    };
    saveData(newData);
  };

  const deleteMachine = (id: string) => {
    const newData = {
      ...data,
      machines: data.machines.filter(m => m.id !== id),
      connections: data.connections.filter(c => c.from !== id && c.to !== id)
    };
    saveData(newData);
  };

  const addConnection = (connection: Omit<Connection, 'id'>) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newData = {
      ...data,
      connections: [...data.connections, newConnection]
    };
    saveData(newData);
  };

  const deleteConnection = (id: string) => {
    const newData = {
      ...data,
      connections: data.connections.filter(c => c.id !== id)
    };
    saveData(newData);
  };

  const toggleFlow = (flowId: string) => {
    const newData = {
      ...data,
      flows: data.flows.map(f => 
        f.id === flowId ? { ...f, enabled: !f.enabled } : f
      )
    };
    saveData(newData);
  };

  const addGroup = (group: Omit<MachineGroup, 'id'>) => {
    const newGroup: MachineGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newData = {
      ...data,
      groups: [...data.groups, newGroup]
    };
    saveData(newData);
  };

  const updateGroup = (id: string, updates: Partial<MachineGroup>) => {
    const newData = {
      ...data,
      groups: data.groups.map(g => g.id === id ? { ...g, ...updates } : g)
    };
    saveData(newData);
  };

  const deleteGroup = (id: string) => {
    const newData = {
      ...data,
      groups: data.groups.filter(g => g.id !== id),
      machines: data.machines.map(m => m.groupId === id ? { ...m, groupId: undefined } : m)
    };
    saveData(newData);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-topology.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    data,
    addMachine,
    updateMachine,
    deleteMachine,
    addConnection,
    deleteConnection,
    addGroup,
    updateGroup,
    deleteGroup,
    toggleFlow,
    exportData,
    saveData
  };
};