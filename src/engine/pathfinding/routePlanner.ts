import { NavigationGraph } from '../graph/navigationGraph';
import { RouteResult, RouteStrategy, Hazard } from '../../types';
import { astarPathfinding, PathfindingResult } from './astar';
import { scoreRoute } from '../routing/routeScoring';
import { generateRouteExplanation } from '../routing/routeExplanation';

export interface PlanRouteOptions {
  startNodeId: string;
  exitNodeId?: string; // If undefined, planner will find the best reachable exit
  strategy: RouteStrategy;
  walkingSpeed?: number;
  hazards?: Hazard[];
  recalculatedDueTo?: string;
}

export function planRoute(
  graph: NavigationGraph,
  options: PlanRouteOptions
): {
  route: RouteResult;
  alternatives: { strategy: RouteStrategy; route: RouteResult }[];
} {
  const {
    startNodeId,
    exitNodeId,
    strategy,
    walkingSpeed = 1.4,
    hazards = [],
    recalculatedDueTo,
  } = options;

  // Make sure dynamic hazard penalties are up to date
  graph.updateHazardPenalties(hazards);

  const startNode = graph.getNode(startNodeId);
  if (!startNode) {
    const empty = scoreRoute(
      graph,
      { found: false, pathNodeIds: [], totalDistance: 0, totalCost: Infinity, nodesVisited: 0, turnsCount: 0 },
      strategy,
      walkingSpeed
    );
    empty.explanation = 'Invalid starting point specified.';
    return { route: empty, alternatives: [] };
  }

  // Determine candidate exits
  let candidateExitIds: string[] = [];
  if (exitNodeId) {
    candidateExitIds = [exitNodeId];
  } else {
    candidateExitIds = graph.getExitNodes().map((e) => e.id);
  }

  if (candidateExitIds.length === 0) {
    const empty = scoreRoute(
      graph,
      { found: false, pathNodeIds: [], totalDistance: 0, totalCost: Infinity, nodesVisited: 0, turnsCount: 0 },
      strategy,
      walkingSpeed
    );
    empty.explanation = 'No emergency exits found in the building.';
    return { route: empty, alternatives: [] };
  }

  // Helper to plan to best exit given strategy
  const findBestRouteForStrategy = (strat: RouteStrategy): { pfResult: PathfindingResult; bestExitId?: string } => {
    let bestResult: PathfindingResult = {
      found: false,
      pathNodeIds: [],
      totalDistance: 0,
      totalCost: Infinity,
      nodesVisited: 0,
      turnsCount: 0,
    };
    let chosenExit: string | undefined = undefined;

    for (const exitId of candidateExitIds) {
      const result = astarPathfinding(graph, startNodeId, exitId, strat);
      if (result.found && result.totalCost < bestResult.totalCost) {
        bestResult = result;
        chosenExit = exitId;
      }
    }

    return { pfResult: bestResult, bestExitId: chosenExit };
  };

  // Run for current chosen strategy
  const primary = findBestRouteForStrategy(strategy);
  const primaryRoute = scoreRoute(graph, primary.pfResult, strategy, walkingSpeed, primary.bestExitId);
  primaryRoute.recalculatedDueTo = recalculatedDueTo;

  // Compute alternatives for other strategies for AI comparison
  const strategies: RouteStrategy[] = ['shortest', 'safest', 'balanced'];
  const alternatives: { strategy: RouteStrategy; route: RouteResult }[] = [];

  for (const s of strategies) {
    const res = findBestRouteForStrategy(s);
    const scored = scoreRoute(graph, res.pfResult, s, walkingSpeed, res.bestExitId);
    alternatives.push({ strategy: s, route: scored });
  }

  // Generate deterministic AI explanation
  const { summary, detailedPoints } = generateRouteExplanation(
    primaryRoute,
    alternatives,
    graph,
    hazards
  );
  primaryRoute.explanation = summary;
  primaryRoute.detailedAnalysis = detailedPoints;

  return {
    route: primaryRoute,
    alternatives,
  };
}
