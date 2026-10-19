import { Hazard } from '../../types';
import { NavigationGraph } from '../graph/navigationGraph';

export interface HazardUpdateResult {
  updatedHazards: Hazard[];
  corridorsBlockedByHazards: string[]; // Edge IDs newly blocked
  hazardIncreased: boolean;
}

export function updateHazardSimulationStep(
  hazards: Hazard[],
  graph: NavigationGraph,
  deltaSeconds: number,
  simulationSpeed: number = 1.0
): HazardUpdateResult {
  let hazardIncreased = false;
  const newlyBlockedEdgeIds: string[] = [];

  const effectiveDelta = deltaSeconds * simulationSpeed;

  const updatedHazards = hazards.map((h) => {
    if (!h.active) return { ...h };

    let newIntensity = h.intensity;
    let newRadius = h.radius;

    if (h.type === 'fire') {
      // Fire grows gradually
      const growthRate = (h.spreadSpeed || 1.0) * 1.5;
      newIntensity = Math.min(100, h.intensity + growthRate * effectiveDelta);
      newRadius = Math.min(15, h.radius + (growthRate * 0.1) * effectiveDelta);
      hazardIncreased = true;
    } else if (h.type === 'flood') {
      // Flood water rises
      const riseRate = (h.spreadSpeed || 0.8) * 1.2;
      newIntensity = Math.min(100, h.intensity + riseRate * effectiveDelta);
      newRadius = Math.min(20, h.radius + (riseRate * 0.12) * effectiveDelta);
      hazardIncreased = true;
    }

    return {
      ...h,
      intensity: Number(newIntensity.toFixed(1)),
      radius: Number(newRadius.toFixed(2)),
    };
  });

  // Recompute graph penalties
  graph.updateHazardPenalties(updatedHazards);

  // If any edge's penalty exceeds 95 from severe fire or flood, mark it blocked
  for (const edge of graph.getAllEdges()) {
    if (!edge.isBlocked && (edge.hazardPenalty || 0) >= 95) {
      edge.isBlocked = true;
      newlyBlockedEdgeIds.push(edge.id);
    }
  }

  return {
    updatedHazards,
    corridorsBlockedByHazards: newlyBlockedEdgeIds,
    hazardIncreased,
  };
}

export function createNewHazard(
  type: Hazard['type'],
  position: [number, number, number],
  intensity: number = 50,
  radius: number = 4.0,
  spreadSpeed: number = 1.0,
  roomId?: string
): Hazard {
  return {
    id: `hazard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    position,
    radius,
    intensity,
    spreadSpeed,
    active: true,
    startTime: Date.now(),
    roomId,
    description: `${type.toUpperCase()} hazard initialized at [${position[0].toFixed(1)}, ${position[2].toFixed(1)}]`,
  };
}
