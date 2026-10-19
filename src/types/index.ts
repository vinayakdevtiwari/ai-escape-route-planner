export type RoomType =
  | 'office'
  | 'classroom'
  | 'laboratory'
  | 'storage'
  | 'lobby'
  | 'stairwell'
  | 'corridor'
  | 'exit'
  | 'restroom'
  | 'conference';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number; // Center X in meters
  y: number; // Floor level or Z/Y (in 3D, floor height)
  z: number; // Center Z in meters
  width: number; // Size in X
  depth: number; // Size in Z
  height: number; // Size in Y
  floor: number;
  color?: string;
  capacity?: number;
  description?: string;
}

export interface NavNode {
  id: string;
  roomId?: string; // Associated room if inside one
  name: string;
  x: number; // 3D X
  y: number; // 3D Y (elevation)
  z: number; // 3D Z
  floor: number;
  isExit: boolean;
  isStart?: boolean;
  exitLabel?: string;
  connectedNodeIds: string[]; // Neighbor node IDs
}

export interface NavEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distance: number; // Euclidean distance in meters
  isBlocked: boolean;
  isDoor?: boolean;
  isStairs?: boolean;
  hazardPenalty: number; // Dynamic cost penalty from nearby hazards
  doorWidth?: number; // In meters
}

export type HazardType = 'fire' | 'flood' | 'blocked';

export interface Hazard {
  id: string;
  type: HazardType;
  roomId?: string;
  nodeId?: string; // Direct node affected
  position: [number, number, number]; // [x, y, z]
  radius: number; // Area of effect in meters
  intensity: number; // 0 to 100
  spreadSpeed: number; // Rate per simulation second
  active: boolean;
  startTime: number;
  description?: string;
}

export type RouteStrategy = 'shortest' | 'safest' | 'balanced';

export interface RouteResult {
  pathNodeIds: string[];
  waypoints: [number, number, number][]; // 3D positions for visual path
  totalDistance: number; // in meters
  estimatedTimeSeconds: number; // in seconds (based on standard walking speed ~ 1.4 m/s)
  hazardExposure: number; // 0 - 100 composite score
  safetyScore: number; // 0 - 100, 100 is completely safe
  turnsCount: number;
  blockedEdgesEncountered: number;
  exitNodeId?: string;
  strategyUsed: RouteStrategy;
  explanation: string;
  detailedAnalysis: string[];
  recalculatedDueTo?: string; // If triggered by hazard dynamic change
  timestamp: number;
}

export interface EvacuationSimState {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'blocked_halted';
  currentPosition: [number, number, number];
  targetPosition: [number, number, number];
  currentNodeIndex: number;
  progressPercent: number;
  distanceTraveled: number;
  distanceRemaining: number;
  elapsedTime: number; // In seconds
  estimatedRemainingTime: number;
  evacueeSpeed: number; // Base speed m/s
  speedMultiplier: number; // Simulation speed factor (1x, 2x, 4x, etc.)
  currentHazardExposure: number;
  activePathNodeIds: string[];
  lastRerouteNotice?: string;
}

export interface BuildingData {
  id: string;
  name: string;
  description: string;
  rooms: Room[];
  nodes: NavNode[];
  edges: NavEdge[];
  defaultStartNodeId?: string;
  defaultExitNodeId?: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  building: BuildingData;
  initialHazards: Hazard[];
  defaultStartNodeId: string;
  defaultExitNodeId?: string;
  recommendedStrategy: RouteStrategy;
}

export interface AnalyticsDataPoint {
  time: number;
  fireIntensity: number;
  floodIntensity: number;
  safetyScore: number;
  evacueeDistanceRemaining: number;
  evacueeProgress: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'high-contrast';
  simulationSpeed: number; // 1, 2, 4
  walkingSpeed: number; // m/s, default 1.4
  showRoomLabels: boolean;
  showWalls: boolean;
  cutawayView: boolean;
  showNavGraph: boolean;
  showGrid: boolean;
  showHazards: boolean;
  showRouteLine: boolean;
  showEmergencyExitsOnly: boolean;
  cameraMode: 'perspective' | 'top-down' | 'isometric';
  units: 'metric' | 'imperial';
}

export type ActiveSidebarTab =
  | 'dashboard'
  | 'building'
  | 'routes'
  | 'hazards'
  | 'editor'
  | 'analytics'
  | 'settings';
