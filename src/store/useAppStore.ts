import { create } from 'zustand';
import {
  ActiveSidebarTab,
  BuildingData,
  Hazard,
  RouteResult,
  RouteStrategy,
  EvacuationSimState,
  AnalyticsDataPoint,
  AppSettings,
  Room,
  NavNode,
  NavEdge,
} from '../types';
import { sampleOfficeBuilding } from '../data/sampleBuildings';
import { sampleScenarios } from '../data/sampleScenarios';
import { NavigationGraph } from '../engine/graph/navigationGraph';
import { planRoute } from '../engine/pathfinding/routePlanner';
import { updateHazardSimulationStep } from '../engine/hazards/hazardEngine';
import { stepEvacuationSimulation } from '../engine/simulation/evacuationEngine';

export interface AppState {
  activeTab: ActiveSidebarTab;
  building: BuildingData;
  graph: NavigationGraph;
  selectedRoomId: string | null;
  selectedNodeId: string | null;
  hoveredRoomId: string | null;

  // Routing
  startNodeId: string;
  selectedExitNodeId?: string; // undefined = auto-detect best exit
  routeStrategy: RouteStrategy;
  currentRoute: RouteResult | null;
  alternativeRoutes: { strategy: RouteStrategy; route: RouteResult }[];

  // Hazards
  hazards: Hazard[];

  // Evacuation Simulation
  evacuationSim: EvacuationSimState;
  analyticsHistory: AnalyticsDataPoint[];

  // Settings
  settings: AppSettings;

  // Status & Notification
  lastAlert: {
    message: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    timestamp: number;
  } | null;

  // Actions
  setActiveTab: (tab: ActiveSidebarTab) => void;
  loadScenario: (scenarioId: string) => void;
  loadBuilding: (building: BuildingData) => void;
  resetToDefaultBuilding: () => void;

  selectRoom: (roomId: string | null) => void;
  setHoveredRoom: (roomId: string | null) => void;
  selectNode: (nodeId: string | null) => void;

  setStartNode: (nodeId: string) => void;
  setSelectedExitNode: (exitNodeId?: string) => void;
  setRouteStrategy: (strategy: RouteStrategy) => void;
  recalculateRoute: (reason?: string) => void;

  // Hazard actions
  addHazard: (hazard: Hazard) => void;
  removeHazard: (hazardId: string) => void;
  toggleHazard: (hazardId: string) => void;
  updateHazardIntensity: (hazardId: string, intensity: number) => void;
  toggleEdgeBlocked: (edgeId: string) => void;

  // Simulation actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speedMultiplier: number) => void;
  tickSimulation: (deltaSeconds: number) => void;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Editor Actions
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  addNode: (node: NavNode) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: NavEdge) => void;
  deleteEdge: (edgeId: string) => void;
  importBuildingJson: (jsonStr: string) => { success: boolean; error?: string };
  exportBuildingJson: () => string;
}

const initialSettings: AppSettings = {
  theme: 'light',
  simulationSpeed: 1,
  walkingSpeed: 1.4,
  showRoomLabels: true,
  showWalls: true,
  cutawayView: true,
  showNavGraph: true,
  showGrid: true,
  showHazards: true,
  showRouteLine: true,
  showEmergencyExitsOnly: false,
  cameraMode: 'isometric',
  units: 'metric',
};

const defaultBuilding = sampleOfficeBuilding;
const initialGraph = new NavigationGraph(defaultBuilding.nodes, defaultBuilding.edges);

// Initial route calculation
const initialPlan = planRoute(initialGraph, {
  startNodeId: defaultBuilding.defaultStartNodeId || 'node-start',
  exitNodeId: defaultBuilding.defaultExitNodeId,
  strategy: 'balanced',
});

const startNode = initialGraph.getNode(defaultBuilding.defaultStartNodeId || 'node-start');
const initialStartPos: [number, number, number] = startNode
  ? [startNode.x, startNode.y + 0.25, startNode.z]
  : [0, 0.25, 0];

const initialSimState: EvacuationSimState = {
  status: 'idle',
  currentPosition: initialStartPos,
  targetPosition: initialPlan.route.waypoints[1] || initialStartPos,
  currentNodeIndex: 0,
  progressPercent: 0,
  distanceTraveled: 0,
  distanceRemaining: initialPlan.route.totalDistance,
  elapsedTime: 0,
  estimatedRemainingTime: initialPlan.route.estimatedTimeSeconds,
  evacueeSpeed: 1.4,
  speedMultiplier: 1,
  currentHazardExposure: 0,
  activePathNodeIds: initialPlan.route.pathNodeIds,
};

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  building: defaultBuilding,
  graph: initialGraph,
  selectedRoomId: null,
  selectedNodeId: null,
  hoveredRoomId: null,

  startNodeId: defaultBuilding.defaultStartNodeId || 'node-start',
  selectedExitNodeId: defaultBuilding.defaultExitNodeId,
  routeStrategy: 'balanced',
  currentRoute: initialPlan.route,
  alternativeRoutes: initialPlan.alternatives,

  hazards: [],
  evacuationSim: initialSimState,
  analyticsHistory: [
    {
      time: 0,
      fireIntensity: 0,
      floodIntensity: 0,
      safetyScore: initialPlan.route.safetyScore,
      evacueeDistanceRemaining: initialPlan.route.totalDistance,
      evacueeProgress: 0,
    },
  ],

  settings: initialSettings,
  lastAlert: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadScenario: (scenarioId) => {
    const scenario = sampleScenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const newGraph = new NavigationGraph(scenario.building.nodes, scenario.building.edges);
    newGraph.updateHazardPenalties(scenario.initialHazards);

    const plan = planRoute(newGraph, {
      startNodeId: scenario.defaultStartNodeId,
      exitNodeId: scenario.defaultExitNodeId,
      strategy: scenario.recommendedStrategy,
      hazards: scenario.initialHazards,
    });

    const sNode = newGraph.getNode(scenario.defaultStartNodeId);
    const sPos: [number, number, number] = sNode
      ? [sNode.x, sNode.y + 0.25, sNode.z]
      : [0, 0.25, 0];

    const nextSimState: EvacuationSimState = {
      status: 'idle',
      currentPosition: sPos,
      targetPosition: plan.route.waypoints[1] || sPos,
      currentNodeIndex: 0,
      progressPercent: 0,
      distanceTraveled: 0,
      distanceRemaining: plan.route.totalDistance,
      elapsedTime: 0,
      estimatedRemainingTime: plan.route.estimatedTimeSeconds,
      evacueeSpeed: get().settings.walkingSpeed,
      speedMultiplier: get().settings.simulationSpeed,
      currentHazardExposure: 0,
      activePathNodeIds: plan.route.pathNodeIds,
    };

    set({
      building: scenario.building,
      graph: newGraph,
      hazards: scenario.initialHazards,
      startNodeId: scenario.defaultStartNodeId,
      selectedExitNodeId: scenario.defaultExitNodeId,
      routeStrategy: scenario.recommendedStrategy,
      currentRoute: plan.route,
      alternativeRoutes: plan.alternatives,
      evacuationSim: nextSimState,
      selectedRoomId: null,
      selectedNodeId: null,
      analyticsHistory: [
        {
          time: 0,
          fireIntensity: scenario.initialHazards.find((h) => h.type === 'fire')?.intensity || 0,
          floodIntensity: scenario.initialHazards.find((h) => h.type === 'flood')?.intensity || 0,
          safetyScore: plan.route.safetyScore,
          evacueeDistanceRemaining: plan.route.totalDistance,
          evacueeProgress: 0,
        },
      ],
      lastAlert: {
        message: `Loaded preset: ${scenario.name}`,
        type: 'info',
        timestamp: Date.now(),
      },
    });
  },

  loadBuilding: (bData) => {
    const newGraph = new NavigationGraph(bData.nodes, bData.edges);
    const startId = bData.defaultStartNodeId || bData.nodes[0]?.id || '';
    const exitId = bData.defaultExitNodeId;

    const plan = planRoute(newGraph, {
      startNodeId: startId,
      exitNodeId: exitId,
      strategy: get().routeStrategy,
    });

    const sNode = newGraph.getNode(startId);
    const sPos: [number, number, number] = sNode
      ? [sNode.x, sNode.y + 0.25, sNode.z]
      : [0, 0.25, 0];

    set({
      building: bData,
      graph: newGraph,
      hazards: [],
      startNodeId: startId,
      selectedExitNodeId: exitId,
      currentRoute: plan.route,
      alternativeRoutes: plan.alternatives,
      evacuationSim: {
        ...initialSimState,
        currentPosition: sPos,
        targetPosition: plan.route.waypoints[1] || sPos,
        distanceRemaining: plan.route.totalDistance,
        estimatedRemainingTime: plan.route.estimatedTimeSeconds,
      },
      lastAlert: {
        message: `Building "${bData.name}" loaded successfully.`,
        type: 'success',
        timestamp: Date.now(),
      },
    });
  },

  resetToDefaultBuilding: () => {
    get().loadBuilding(sampleOfficeBuilding);
  },

  selectRoom: (roomId) => set({ selectedRoomId: roomId }),
  setHoveredRoom: (roomId) => set({ hoveredRoomId: roomId }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setStartNode: (nodeId) => {
    set({ startNodeId: nodeId });
    get().recalculateRoute('Start location changed');
    get().resetSimulation();
  },

  setSelectedExitNode: (exitNodeId) => {
    set({ selectedExitNodeId: exitNodeId });
    get().recalculateRoute('Destination exit preference changed');
  },

  setRouteStrategy: (strategy) => {
    set({ routeStrategy: strategy });
    get().recalculateRoute(`Strategy switched to ${strategy}`);
  },

  recalculateRoute: (reason) => {
    const { graph, startNodeId, selectedExitNodeId, routeStrategy, hazards, settings, evacuationSim } = get();

    // If evacuation is running, plan from the evacuee's current node rather than origin!
    let originNodeId = startNodeId;
    if (evacuationSim.status === 'running' || evacuationSim.status === 'blocked_halted') {
      const activePath = evacuationSim.activePathNodeIds;
      if (activePath.length > 0 && evacuationSim.currentNodeIndex < activePath.length) {
        originNodeId = activePath[evacuationSim.currentNodeIndex];
      }
    }

    const plan = planRoute(graph, {
      startNodeId: originNodeId,
      exitNodeId: selectedExitNodeId,
      strategy: routeStrategy,
      walkingSpeed: settings.walkingSpeed,
      hazards,
      recalculatedDueTo: reason,
    });

    const isBlocked = plan.route.pathNodeIds.length === 0;

    set((state) => {
      const updatedSim: EvacuationSimState = {
        ...state.evacuationSim,
        status: isBlocked ? 'blocked_halted' : state.evacuationSim.status === 'blocked_halted' ? 'running' : state.evacuationSim.status,
        distanceRemaining: plan.route.totalDistance,
        estimatedRemainingTime: plan.route.estimatedTimeSeconds,
        activePathNodeIds: plan.route.pathNodeIds,
        lastRerouteNotice: reason,
      };

      return {
        currentRoute: plan.route,
        alternativeRoutes: plan.alternatives,
        evacuationSim: updatedSim,
        lastAlert: {
          message: isBlocked
            ? 'CRITICAL: No accessible escape route found!'
            : reason
            ? `Route updated: ${reason}`
            : 'Route recalculated successfully.',
          type: isBlocked ? 'danger' : 'warning',
          timestamp: Date.now(),
        },
      };
    });
  },

  addHazard: (hazard) => {
    set((state) => {
      const newHazards = [...state.hazards, hazard];
      state.graph.updateHazardPenalties(newHazards);
      return { hazards: newHazards };
    });
    get().recalculateRoute(`New ${hazard.type.toUpperCase()} hazard detected`);
  },

  removeHazard: (hazardId) => {
    set((state) => {
      const newHazards = state.hazards.filter((h) => h.id !== hazardId);
      state.graph.updateHazardPenalties(newHazards);
      return { hazards: newHazards };
    });
    get().recalculateRoute('Hazard extinguished / cleared');
  },

  toggleHazard: (hazardId) => {
    set((state) => {
      const newHazards = state.hazards.map((h) =>
        h.id === hazardId ? { ...h, active: !h.active } : h
      );
      state.graph.updateHazardPenalties(newHazards);
      return { hazards: newHazards };
    });
    get().recalculateRoute('Hazard active state changed');
  },

  updateHazardIntensity: (hazardId, intensity) => {
    set((state) => {
      const newHazards = state.hazards.map((h) =>
        h.id === hazardId ? { ...h, intensity } : h
      );
      state.graph.updateHazardPenalties(newHazards);
      return { hazards: newHazards };
    });
    get().recalculateRoute('Hazard intensity altered');
  },

  toggleEdgeBlocked: (edgeId) => {
    const { graph } = get();
    const edge = graph.getEdge(edgeId);
    if (!edge) return;

    const newBlocked = !edge.isBlocked;
    graph.setEdgeBlocked(edgeId, newBlocked);

    // Also update building.edges copy
    set((state) => ({
      building: {
        ...state.building,
        edges: state.building.edges.map((e) =>
          e.id === edgeId ? { ...e, isBlocked: newBlocked } : e
        ),
      },
    }));

    const fromNode = graph.getNode(edge.fromNodeId);
    const toNode = graph.getNode(edge.toNodeId);
    const passageDesc = fromNode && toNode ? `${fromNode.name} - ${toNode.name}` : edgeId;

    get().recalculateRoute(`Corridor [${passageDesc}] was ${newBlocked ? 'BLOCKED' : 'CLEARED'}`);
  },

  startSimulation: () => {
    const { evacuationSim, currentRoute } = get();
    if (!currentRoute || currentRoute.pathNodeIds.length === 0) {
      set({
        lastAlert: {
          message: 'Cannot start simulation: no valid escape route exists.',
          type: 'danger',
          timestamp: Date.now(),
        },
      });
      return;
    }

    set({
      evacuationSim: {
        ...evacuationSim,
        status: 'running',
      },
      lastAlert: {
        message: 'Evacuation simulation initialized. Subject in transit.',
        type: 'info',
        timestamp: Date.now(),
      },
    });
  },

  pauseSimulation: () => {
    set((state) => ({
      evacuationSim: {
        ...state.evacuationSim,
        status: 'paused',
      },
    }));
  },

  resumeSimulation: () => {
    set((state) => ({
      evacuationSim: {
        ...state.evacuationSim,
        status: 'running',
      },
    }));
  },

  resetSimulation: () => {
    const { graph, startNodeId, currentRoute, settings } = get();
    const sNode = graph.getNode(startNodeId);
    const sPos: [number, number, number] = sNode
      ? [sNode.x, sNode.y + 0.25, sNode.z]
      : [0, 0.25, 0];

    const dist = currentRoute?.totalDistance || 0;
    const estTime = currentRoute?.estimatedTimeSeconds || 0;

    set({
      evacuationSim: {
        status: 'idle',
        currentPosition: sPos,
        targetPosition: currentRoute?.waypoints[1] || sPos,
        currentNodeIndex: 0,
        progressPercent: 0,
        distanceTraveled: 0,
        distanceRemaining: dist,
        elapsedTime: 0,
        estimatedRemainingTime: estTime,
        evacueeSpeed: settings.walkingSpeed,
        speedMultiplier: settings.simulationSpeed,
        currentHazardExposure: 0,
        activePathNodeIds: currentRoute?.pathNodeIds || [],
      },
      analyticsHistory: [
        {
          time: 0,
          fireIntensity: 0,
          floodIntensity: 0,
          safetyScore: currentRoute?.safetyScore || 100,
          evacueeDistanceRemaining: dist,
          evacueeProgress: 0,
        },
      ],
      lastAlert: {
        message: 'Simulation cleared and reset to initial starting coordinates.',
        type: 'info',
        timestamp: Date.now(),
      },
    });
  },

  setSimulationSpeed: (speedMultiplier) => {
    set((state) => ({
      settings: { ...state.settings, simulationSpeed: speedMultiplier },
      evacuationSim: { ...state.evacuationSim, speedMultiplier },
    }));
  },

  tickSimulation: (deltaSeconds) => {
    const { evacuationSim, currentRoute, graph, hazards, settings } = get();

    // 1. Advance hazards
    const hasActiveHazards = hazards.some((h) => h.active);
    if (hasActiveHazards) {
      const hazardUpdate = updateHazardSimulationStep(
        hazards,
        graph,
        deltaSeconds,
        settings.simulationSpeed
      );

      if (hazardUpdate.hazardIncreased) {
        set({ hazards: hazardUpdate.updatedHazards });
      }

      if (hazardUpdate.corridorsBlockedByHazards.length > 0) {
        get().recalculateRoute('Hazard threshold breached: corridor blocked by fire/flood');
      }
    }

    // 2. Step evacuee
    if (evacuationSim.status === 'running' && currentRoute) {
      const simResult = stepEvacuationSimulation(
        evacuationSim,
        currentRoute,
        graph,
        deltaSeconds
      );

      set({ evacuationSim: simResult.nextState });

      if (simResult.recalculationRequested) {
        get().recalculateRoute(simResult.recalculationReason || 'Immediate path obstruction detected');
      }

      if (simResult.hasArrived) {
        set({
          lastAlert: {
            message: 'EVACUATION COMPLETE: Evacuee has successfully exited the building!',
            type: 'success',
            timestamp: Date.now(),
          },
        });
      }

      // 3. Append to Analytics every ~1s of elapsed sim time
      const lastPoint = get().analyticsHistory[get().analyticsHistory.length - 1];
      if (!lastPoint || simResult.nextState.elapsedTime - lastPoint.time >= 1.0) {
        const fire = get().hazards.find((h) => h.type === 'fire')?.intensity || 0;
        const flood = get().hazards.find((h) => h.type === 'flood')?.intensity || 0;

        set((state) => ({
          analyticsHistory: [
            ...state.analyticsHistory.slice(-50), // keep latest 50 points
            {
              time: Number(simResult.nextState.elapsedTime.toFixed(1)),
              fireIntensity: fire,
              floodIntensity: flood,
              safetyScore: get().currentRoute?.safetyScore || 0,
              evacueeDistanceRemaining: simResult.nextState.distanceRemaining,
              evacueeProgress: simResult.nextState.progressPercent,
            },
          ],
        }));
      }
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  // Building Editor
  addRoom: (room) => {
    set((state) => {
      const newRooms = [...state.building.rooms, room];
      // Automatically add a central navigation node for this new room
      const newNode: NavNode = {
        id: `node-${room.id}`,
        roomId: room.id,
        name: `${room.name} Center`,
        x: room.x,
        y: room.y,
        z: room.z,
        floor: room.floor,
        isExit: room.type === 'exit',
        exitLabel: room.type === 'exit' ? `EXIT ${room.name.slice(0, 4).toUpperCase()}` : undefined,
        connectedNodeIds: [],
      };
      const newNodes = [...state.building.nodes, newNode];
      const newBuilding = { ...state.building, rooms: newRooms, nodes: newNodes };
      state.graph.build(newNodes, state.building.edges);
      return { building: newBuilding };
    });
    get().recalculateRoute('New room added to floor plan');
  },

  updateRoom: (roomId, updates) => {
    set((state) => {
      const newRooms = state.building.rooms.map((r) =>
        r.id === roomId ? { ...r, ...updates } : r
      );
      return {
        building: { ...state.building, rooms: newRooms },
      };
    });
  },

  deleteRoom: (roomId) => {
    set((state) => {
      const newRooms = state.building.rooms.filter((r) => r.id !== roomId);
      // Remove associated nodes and edges
      const removedNodeIds = new Set(
        state.building.nodes.filter((n) => n.roomId === roomId).map((n) => n.id)
      );
      const newNodes = state.building.nodes.filter((n) => !removedNodeIds.has(n.id));
      const newEdges = state.building.edges.filter(
        (e) => !removedNodeIds.has(e.fromNodeId) && !removedNodeIds.has(e.toNodeId)
      );

      const newBuilding = {
        ...state.building,
        rooms: newRooms,
        nodes: newNodes,
        edges: newEdges,
      };
      state.graph.build(newNodes, newEdges);

      return {
        building: newBuilding,
        selectedRoomId: state.selectedRoomId === roomId ? null : state.selectedRoomId,
      };
    });
    get().recalculateRoute('Room and associated passages removed');
  },

  addNode: (node) => {
    set((state) => {
      const newNodes = [...state.building.nodes, node];
      const newBuilding = { ...state.building, nodes: newNodes };
      state.graph.build(newNodes, state.building.edges);
      return { building: newBuilding };
    });
  },

  deleteNode: (nodeId) => {
    set((state) => {
      const newNodes = state.building.nodes.filter((n) => n.id !== nodeId);
      const newEdges = state.building.edges.filter(
        (e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId
      );
      const newBuilding = { ...state.building, nodes: newNodes, edges: newEdges };
      state.graph.build(newNodes, newEdges);
      return { building: newBuilding };
    });
    get().recalculateRoute('Navigation node deleted');
  },

  addEdge: (edge) => {
    set((state) => {
      const newEdges = [...state.building.edges, edge];
      const newBuilding = { ...state.building, edges: newEdges };
      state.graph.build(state.building.nodes, newEdges);
      return { building: newBuilding };
    });
    get().recalculateRoute('New passage connection formed');
  },

  deleteEdge: (edgeId) => {
    set((state) => {
      const newEdges = state.building.edges.filter((e) => e.id !== edgeId);
      const newBuilding = { ...state.building, edges: newEdges };
      state.graph.build(state.building.nodes, newEdges);
      return { building: newBuilding };
    });
    get().recalculateRoute('Passage connection removed');
  },

  importBuildingJson: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.rooms || !parsed.nodes || !parsed.edges) {
        return { success: false, error: 'JSON missing required rooms, nodes, or edges arrays.' };
      }
      get().loadBuilding(parsed);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON format.' };
    }
  },

  exportBuildingJson: () => {
    const { building } = get();
    return JSON.stringify(building, null, 2);
  },
}));
