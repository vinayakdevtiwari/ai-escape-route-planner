import { EvacuationSimState, RouteResult } from '../../types';
import { NavigationGraph } from '../graph/navigationGraph';

export interface EvacuationStepResult {
  nextState: EvacuationSimState;
  recalculationRequested: boolean;
  recalculationReason?: string;
  hasArrived: boolean;
}

export function stepEvacuationSimulation(
  state: EvacuationSimState,
  route: RouteResult,
  graph: NavigationGraph,
  deltaSeconds: number
): EvacuationStepResult {
  if (state.status !== 'running') {
    return {
      nextState: state,
      recalculationRequested: false,
      hasArrived: state.status === 'completed',
    };
  }

  const waypoints = route.waypoints;
  const pathNodeIds = route.pathNodeIds;

  if (waypoints.length === 0 || pathNodeIds.length === 0) {
    return {
      nextState: { ...state, status: 'blocked_halted' },
      recalculationRequested: true,
      recalculationReason: 'Current route has no valid waypoints.',
      hasArrived: false,
    };
  }

  // Check if upcoming segments on route are blocked or compromised
  for (let i = state.currentNodeIndex; i < pathNodeIds.length - 1; i++) {
    const edge = graph.findEdgeBetween(pathNodeIds[i], pathNodeIds[i + 1]);
    if (!edge || edge.isBlocked || (edge.hazardPenalty || 0) >= 95) {
      const blockedNodeA = graph.getNode(pathNodeIds[i]);
      const blockedNodeB = graph.getNode(pathNodeIds[i + 1]);
      const corridorDesc = blockedNodeA && blockedNodeB
        ? `${blockedNodeA.name} to ${blockedNodeB.name}`
        : 'upcoming corridor';

      return {
        nextState: {
          ...state,
          status: 'blocked_halted',
          lastRerouteNotice: `Hazard blocked passage ahead (${corridorDesc})!`,
        },
        recalculationRequested: true,
        recalculationReason: `Direct path ahead (${corridorDesc}) was blocked by emergency conditions`,
        hasArrived: false,
      };
    }
  }

  // If already at or beyond last waypoint
  if (state.currentNodeIndex >= waypoints.length - 1) {
    return {
      nextState: {
        ...state,
        status: 'completed',
        progressPercent: 100,
        distanceRemaining: 0,
        estimatedRemainingTime: 0,
      },
      recalculationRequested: false,
      hasArrived: true,
    };
  }

  // Move towards next waypoint
  const currentTargetIndex = state.currentNodeIndex + 1;
  const targetPos = waypoints[currentTargetIndex];
  const currentPos = [...state.currentPosition] as [number, number, number];

  const dx = targetPos[0] - currentPos[0];
  const dy = targetPos[1] - currentPos[1];
  const dz = targetPos[2] - currentPos[2];
  const distToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Speed calculation with simulation multiplier
  const effectiveSpeed = state.evacueeSpeed * state.speedMultiplier;
  const stepDist = effectiveSpeed * deltaSeconds;

  let newPos: [number, number, number];
  let nextNodeIndex = state.currentNodeIndex;
  let newDistTraveled = state.distanceTraveled + Math.min(stepDist, distToTarget);

  if (stepDist >= distToTarget || distToTarget < 0.05) {
    // Reached this waypoint
    newPos = [...targetPos];
    nextNodeIndex = currentTargetIndex;

    // Check if reached final waypoint
    if (nextNodeIndex >= waypoints.length - 1) {
      return {
        nextState: {
          ...state,
          currentPosition: newPos,
          currentNodeIndex: nextNodeIndex,
          status: 'completed',
          progressPercent: 100,
          distanceRemaining: 0,
          distanceTraveled: Number(route.totalDistance.toFixed(1)),
          estimatedRemainingTime: 0,
          elapsedTime: Number((state.elapsedTime + deltaSeconds * state.speedMultiplier).toFixed(1)),
        },
        recalculationRequested: false,
        hasArrived: true,
      };
    }
  } else {
    // Interpolate towards target
    const ratio = stepDist / distToTarget;
    newPos = [
      currentPos[0] + dx * ratio,
      currentPos[1] + dy * ratio,
      currentPos[2] + dz * ratio,
    ];
  }

  const remainingDist = Math.max(0, route.totalDistance - newDistTraveled);
  const progressPercent = Math.min(100, Math.round((newDistTraveled / Math.max(0.1, route.totalDistance)) * 100));
  const estRemainingTime = Math.max(0, Math.round(remainingDist / Math.max(0.5, state.evacueeSpeed)));

  // Calculate current hazard exposure at evacuee's location
  let currentExposure = 0;
  if (state.currentNodeIndex < pathNodeIds.length - 1) {
    const activeEdge = graph.findEdgeBetween(
      pathNodeIds[state.currentNodeIndex],
      pathNodeIds[state.currentNodeIndex + 1]
    );
    if (activeEdge) {
      currentExposure = activeEdge.hazardPenalty || 0;
    }
  }

  return {
    nextState: {
      ...state,
      currentPosition: newPos,
      targetPosition: waypoints[Math.min(waypoints.length - 1, nextNodeIndex + 1)],
      currentNodeIndex: nextNodeIndex,
      progressPercent,
      distanceTraveled: Number(newDistTraveled.toFixed(1)),
      distanceRemaining: Number(remainingDist.toFixed(1)),
      elapsedTime: Number((state.elapsedTime + deltaSeconds * state.speedMultiplier).toFixed(1)),
      estimatedRemainingTime: estRemainingTime,
      currentHazardExposure: currentExposure,
      activePathNodeIds: pathNodeIds,
    },
    recalculationRequested: false,
    hasArrived: false,
  };
}
