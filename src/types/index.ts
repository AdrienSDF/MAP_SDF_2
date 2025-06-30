export interface Machine {
  id: string;
  hostname: string;
  privateIP: string;
  type: 'vm' | 'physical' | 'cloud';
  position: { x: number; y: number };
  environment: 'aws' | 'ovh' | 'onprem';
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'vpn' | 'internal' | 'internet' | 'basic';
  style: 'solid' | 'dashed' | 'dotted';
}

export interface NetworkFlow {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
}

export interface NetworkTopology {
  machines: Machine[];
  connections: Connection[];
  flows: NetworkFlow[];
}

export interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedMachine: string | null;
  isConnecting: boolean;
  connectionStart: string | null;
}