import { NavigationGraph } from '../graph/navigationGraph';
import { RouteResult, RouteStrategy } from '../../types';
import { PathfindingResult } from '../pathfinding/astar';

export function scoreRoute(
  graph: NavigationGraph,
  pathfindingResult: PathfindingResult,
  strategy: RouteStrategy,
  walkingSpeed: number = 1.4, // m/s
  exitNodeId?: string
): RouteResult {
  const { pathNodeIds, totalDistance, turnsCount } = pathfindingResult;

  if (!pathfindingResult.found || pathNodeIds.length === 0) {
    return {
      pathNodeIds: [],
      waypoints: [],
      totalDistance: 0,
      estimatedTimeSeconds: 0,
      hazardExposure: 100,
      safetyScore: 0,
      turnsCount: 0,
      blockedEdgesEncountered: 0,
      strategyUsed: strategy,
      explanation: 'No accessible evacuation route available.',
      detailedAnalysis: ['All potential paths to exits are blocked or severed by active hazards.'],
      timestamp: Date.now(),
    };
  }

  // Generate 3D waypoints with slight elevation offset so they float cleanly over floor
  const waypoints: [number, number, number][] = [];
  for (const nid of pathNodeIds) {
    const node = graph.getNode(nid);
    if (node) {
      waypoints.push([node.x, node.y + 0.25, node.z]);
    }
  }

  // Calculate hazard exposure on traversed edges
  let totalHazard = 0;
  let peakHazard = 0;
  let edgeCount = 0;
  let stairsDelay = 0;
  let doorDelay = 0;

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const edge = graph.findEdgeBetween(pathNodeIds[i], pathNodeIds[i + 1]);
    if (edge) {
      edgeCount++;
      const penalty = edge.hazardPenalty || 0;
      totalHazard += penalty;
      if (penalty > peakHazard) {
        peakHazard = penalty;
      }
      if (edge.isStairs) {
        stairsDelay += 4; // 4 seconds delay for navigating stairs
      }
      if (edge.isDoor) {
        doorDelay += 1.5; // 1.5 seconds delay for opening door
      }
    }
  }

  const avgHazard = edgeCount > 0 ? totalHazard / edgeCount : 0;
  // Composite hazard exposure (0 - 100)
  const hazardExposure = Math.min(100, Math.round(peakHazard * 0.65 + avgHazard * 0.35));
  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - hazardExposure)));

  // Turn slowdown: each turn adds ~0.8s
  const turnsDelay = turnsCount * 0.8;
  const baseWalkingTime = totalDistance / Math.max(0.5, walkingSpeed);
  const estimatedTimeSeconds = Math.round(baseWalkingTime + stairsDelay + doorDelay + turnsDelay);

  const finalExitId = exitNodeId || pathNodeIds[pathNodeIds.length - 1];

  return {
    pathNodeIds,
    waypoints,
    totalDistance: Number(totalDistance.toFixed(1)),
    estimatedTimeSeconds,
    hazardExposure,
    safetyScore,
    turnsCount,
    blockedEdgesEncountered: 0,
    exitNodeId: finalExitId,
    strategyUsed: strategy,
    explanation: '',
    detailedAnalysis: [],
    timestamp: Date.now(),
  };
}
