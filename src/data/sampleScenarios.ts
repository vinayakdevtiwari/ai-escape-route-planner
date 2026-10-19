import { ScenarioPreset, Hazard } from '../types';
import { sampleOfficeBuilding, sampleSchoolBuilding } from './sampleBuildings';

export const sampleScenarios: ScenarioPreset[] = [
  {
    id: 'scenario-office-normal',
    name: 'Scenario 1: Office Building (Baseline)',
    category: 'Commercial',
    description: 'Baseline corporate environment with standard occupancy. Both East and West emergency gates are operational with zero hazards present.',
    building: sampleOfficeBuilding,
    initialHazards: [],
    defaultStartNodeId: 'node-start',
    defaultExitNodeId: 'node-exit-west',
    recommendedStrategy: 'shortest',
  },
  {
    id: 'scenario-school-normal',
    name: 'Scenario 2: School Complex (Baseline)',
    category: 'Academic',
    description: 'High school science hall with multiple classrooms, central atrium, and three exterior emergency gates.',
    building: sampleSchoolBuilding,
    initialHazards: [],
    defaultStartNodeId: 'sn-bio',
    defaultExitNodeId: 'sn-exit-main',
    recommendedStrategy: 'balanced',
  },
  {
    id: 'scenario-fire-emergency',
    name: 'Scenario 3: Fire Emergency in West Corridor',
    category: 'Active Incident',
    description: 'Severe electrical fire ignites in the West Corridor near the Breakroom. The primary western exit corridor becomes dangerous and compromised, testing safe alternative rerouting to East Exit B.',
    building: sampleOfficeBuilding,
    initialHazards: [
      {
        id: 'hazard-fire-1',
        type: 'fire',
        roomId: 'room-corridor-central',
        nodeId: 'node-corr-far-west',
        position: [-12, 0, 0],
        radius: 6.5,
        intensity: 85,
        spreadSpeed: 1.5,
        active: true,
        startTime: Date.now(),
        description: 'Class C electrical fire raging at Corridor Junction West.',
      },
    ],
    defaultStartNodeId: 'node-start',
    defaultExitNodeId: 'node-exit-east',
    recommendedStrategy: 'safest',
  },
  {
    id: 'scenario-blocked-exit',
    name: 'Scenario 4: Blocked Exit (Structural Barrier)',
    category: 'Active Incident',
    description: 'A physical structural collapse completely blocks the primary West Emergency Exit door. The system must automatically detect the failure and navigate to the secondary East Exit.',
    building: {
      ...sampleOfficeBuilding,
      edges: sampleOfficeBuilding.edges.map((e) =>
        e.id === 'edge-4' // West exit edge
          ? { ...e, isBlocked: true }
          : e
      ),
    },
    initialHazards: [
      {
        id: 'hazard-blocked-1',
        type: 'blocked',
        nodeId: 'node-exit-west',
        position: [-16, 0, -6],
        radius: 3.5,
        intensity: 100,
        spreadSpeed: 0,
        active: true,
        startTime: Date.now(),
        description: 'Heavy structural debris fallen across West Exit A doorway.',
      },
    ],
    defaultStartNodeId: 'node-start',
    defaultExitNodeId: 'node-exit-east',
    recommendedStrategy: 'balanced',
  },
  {
    id: 'scenario-flood-emergency',
    name: 'Scenario 5: Water Main Burst & Corridor Flooding',
    category: 'Active Incident',
    description: 'Burst municipal pipe causes rising water levels along the Central Spine Corridor. Movement is significantly slowed or blocked, requiring the planner to divert evacuees through the elevated Lobby.',
    building: sampleOfficeBuilding,
    initialHazards: [
      {
        id: 'hazard-flood-1',
        type: 'flood',
        roomId: 'room-corridor-central',
        nodeId: 'node-corr-mid',
        position: [0, 0, 0],
        radius: 7.0,
        intensity: 90,
        spreadSpeed: 1.2,
        active: true,
        startTime: Date.now(),
        description: 'Pressurized water main rupture flooding the center corridor with 18 inches of standing water.',
      },
    ],
    defaultStartNodeId: 'node-start',
    defaultExitNodeId: 'node-exit-east',
    recommendedStrategy: 'safest',
  },
];
