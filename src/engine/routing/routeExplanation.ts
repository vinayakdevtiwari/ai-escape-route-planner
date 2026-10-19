import { RouteResult, RouteStrategy, Hazard } from '../../types';
import { NavigationGraph } from '../graph/navigationGraph';

export function generateRouteExplanation(
  currentRoute: RouteResult,
  alternativeRoutes: { strategy: RouteStrategy; route: RouteResult }[],
  graph: NavigationGraph,
  activeHazards: Hazard[]
): { summary: string; detailedPoints: string[] } {
  if (currentRoute.pathNodeIds.length === 0) {
    const blockedEdges = graph.getAllEdges().filter((e) => e.isBlocked).length;
    const activeHazardsCount = activeHazards.filter((h) => h.active).length;

    const points: string[] = [
      'No viable escape path connects the start location to any designated exit.',
      `Active conditions: ${activeHazardsCount} active hazard(s), ${blockedEdges} physically impassable corridor(s).`,
      'Recommendation: Clear blocked corridors or extinguish fire barriers to restore safe transit.',
    ];

    return {
      summary: 'CRITICAL ALERT: All evacuation routes are currently impassable.',
      detailedPoints: points,
    };
  }

  const exitNode = currentRoute.exitNodeId ? graph.getNode(currentRoute.exitNodeId) : undefined;
  const exitName = exitNode ? exitNode.name : 'Emergency Exit';
  const points: string[] = [];
  let summary = '';

  const shortestAlt = alternativeRoutes.find((a) => a.strategy === 'shortest')?.route;
  const safestAlt = alternativeRoutes.find((a) => a.strategy === 'safest')?.route;

  const hasFire = activeHazards.some((h) => h.active && h.type === 'fire');
  const hasFlood = activeHazards.some((h) => h.active && h.type === 'flood');
  const hasBlocked = graph.getAllEdges().some((e) => e.isBlocked);

  // Check if chosen route detours around a hazard compared to shortest
  const isDetourForSafety =
    shortestAlt &&
    shortestAlt.pathNodeIds.length > 0 &&
    shortestAlt.totalDistance < currentRoute.totalDistance &&
    shortestAlt.hazardExposure > currentRoute.hazardExposure;

  if (currentRoute.recalculatedDueTo) {
    summary = `Route dynamically recalculated: ${currentRoute.recalculatedDueTo}. Routing towards ${exitName}.`;
  } else if (isDetourForSafety) {
    const extraDist = (currentRoute.totalDistance - shortestAlt.totalDistance).toFixed(1);
    const safetyGain = currentRoute.safetyScore - shortestAlt.safetyScore;
    summary = `Selected route bypasses danger zones: adding ${extraDist}m of travel to achieve a +${safetyGain} safety score gain.`;
  } else if (currentRoute.strategyUsed === 'safest') {
    summary = `Prioritizing maximum safety (${currentRoute.safetyScore}/100) towards ${exitName}.`;
  } else if (currentRoute.strategyUsed === 'shortest') {
    summary = `Direct shortest path selected (${currentRoute.totalDistance}m, ~${currentRoute.estimatedTimeSeconds}s) to ${exitName}.`;
  } else {
    summary = `Optimal balanced path chosen: ${currentRoute.totalDistance}m travel with ${currentRoute.safetyScore}/100 safety score to ${exitName}.`;
  }

  // Generate detailed diagnostic points
  points.push(
    `Exit Destination: ${exitName} (Floor ${exitNode?.floor ?? 1}) via ${currentRoute.pathNodeIds.length} navigation waypoints.`
  );
  points.push(
    `Safety Assessment: Score ${currentRoute.safetyScore}/100 with hazard exposure index of ${currentRoute.hazardExposure}%.`
  );
  points.push(
    `Travel Metrics: Total distance ${currentRoute.totalDistance}m, estimated transit time ${currentRoute.estimatedTimeSeconds} seconds.`
  );

  if (currentRoute.turnsCount > 0) {
    points.push(
      `Navigation Profile: Contains ${currentRoute.turnsCount} directional turn(s), minimizing disorientation in low-visibility conditions.`
    );
  }

  if (hasFire && currentRoute.safetyScore < 90) {
    points.push('Notice: Route passes within the perimeter of a thermal/smoke warning zone. Move swiftly.');
  }

  if (hasFlood && currentRoute.safetyScore < 90) {
    points.push('Notice: Elevated water levels detected near connecting corridors. Traversal speed may be reduced.');
  }

  if (hasBlocked) {
    points.push('Corridor Status: Impassable barriers avoided during route synthesis.');
  }

  if (shortestAlt && safestAlt && shortestAlt !== currentRoute) {
    points.push(
      `Comparative Trade-off: Shortest alternative is ${shortestAlt.totalDistance}m (${shortestAlt.safetyScore}/100 safety); Safest is ${safestAlt.totalDistance}m (${safestAlt.safetyScore}/100 safety).`
    );
  }

  return { summary, detailedPoints: points };
}
