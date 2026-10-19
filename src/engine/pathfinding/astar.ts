import { NavigationGraph } from '../graph/navigationGraph';
import { NavNode, RouteStrategy } from '../../types';

export interface PathfindingResult {
  found: boolean;
  pathNodeIds: string[];
  totalDistance: number;
  totalCost: number;
  nodesVisited: number;
  turnsCount: number;
}

// 3D Euclidean heuristic
function euclideanDistance(a: NavNode, b: NavNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function astarPathfinding(
  graph: NavigationGraph,
  startNodeId: string,
  targetNodeId: string,
  strategy: RouteStrategy = 'balanced'
): PathfindingResult {
  const startNode = graph.getNode(startNodeId);
  const targetNode = graph.getNode(targetNodeId);

  if (!startNode || !targetNode) {
    return {
      found: false,
      pathNodeIds: [],
      totalDistance: 0,
      totalCost: Infinity,
      nodesVisited: 0,
      turnsCount: 0,
    };
  }

  if (startNodeId === targetNodeId) {
    return {
      found: true,
      pathNodeIds: [startNodeId],
      totalDistance: 0,
      totalCost: 0,
      nodesVisited: 1,
      turnsCount: 0,
    };
  }

  const openSet = new Set<string>([startNodeId]);
  const cameFrom = new Map<string, string>(); // current -> predecessor
  const gScore = new Map<string, number>(); // cost from start
  const fScore = new Map<string, number>(); // estimated total cost

  for (const node of graph.getAllNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }

  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, euclideanDistance(startNode, targetNode));

  let nodesVisited = 0;

  while (openSet.size > 0) {
    // Pick node in openSet with lowest fScore
    let currentId: string | null = null;
    let lowestF = Infinity;

    for (const nodeId of openSet) {
      const f = fScore.get(nodeId) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentId = nodeId;
      }
    }

    if (!currentId || lowestF === Infinity) {
      break;
    }

    if (currentId === targetNodeId) {
      // Goal reached! Reconstruct path
      const pathNodeIds: string[] = [targetNodeId];
      let curr = targetNodeId;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr)!;
        pathNodeIds.unshift(curr);
      }

      // Calculate true geometric distance
      let totalDistance = 0;
      for (let i = 0; i < pathNodeIds.length - 1; i++) {
        const edge = graph.findEdgeBetween(pathNodeIds[i], pathNodeIds[i + 1]);
        if (edge) {
          totalDistance += edge.distance;
        }
      }

      const turnsCount = calculateTurnsCount(graph, pathNodeIds);

      return {
        found: true,
        pathNodeIds,
        totalDistance: Number(totalDistance.toFixed(2)),
        totalCost: Number((gScore.get(targetNodeId) || 0).toFixed(2)),
        nodesVisited,
        turnsCount,
      };
    }

    openSet.delete(currentId);
    nodesVisited++;

    const currentNode = graph.getNode(currentId)!;
    const neighbors = graph.getNeighborNodes(currentId);

    for (const { node: neighbor, edge } of neighbors) {
      // Check edge blocked
      if (edge.isBlocked) {
        continue;
      }

      const edgeCost = graph.getEdgeCost(edge, strategy);
      if (edgeCost === Infinity) {
        continue;
      }

      const tentativeG = (gScore.get(currentId) || 0) + edgeCost;

      if (tentativeG < (gScore.get(neighbor.id) ?? Infinity)) {
        cameFrom.set(neighbor.id, currentId);
        gScore.set(neighbor.id, tentativeG);
        const h = euclideanDistance(neighbor, targetNode);
        fScore.set(neighbor.id, tentativeG + h);

        openSet.add(neighbor.id);
      }
    }
  }

  return {
    found: false,
    pathNodeIds: [],
    totalDistance: 0,
    totalCost: Infinity,
    nodesVisited,
    turnsCount: 0,
  };
}

function calculateTurnsCount(graph: NavigationGraph, pathNodeIds: string[]): number {
  if (pathNodeIds.length < 3) return 0;
  let turns = 0;

  for (let i = 1; i < pathNodeIds.length - 1; i++) {
    const prev = graph.getNode(pathNodeIds[i - 1]);
    const curr = graph.getNode(pathNodeIds[i]);
    const next = graph.getNode(pathNodeIds[i + 1]);

    if (!prev || !curr || !next) continue;

    const v1x = curr.x - prev.x;
    const v1z = curr.z - prev.z;
    const v2x = next.x - curr.x;
    const v2z = next.z - curr.z;

    const mag1 = Math.sqrt(v1x * v1x + v1z * v1z);
    const mag2 = Math.sqrt(v2x * v2x + v2z * v2z);

    if (mag1 > 0.01 && mag2 > 0.01) {
      const dot = (v1x * v2x + v1z * v2z) / (mag1 * mag2);
      // If angle deviation is more than ~25 degrees (cos < 0.90), count as turn
      if (dot < 0.9) {
        turns++;
      }
    }
  }

  return turns;
}
