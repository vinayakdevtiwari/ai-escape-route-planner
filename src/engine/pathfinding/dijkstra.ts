import { NavigationGraph } from '../graph/navigationGraph';
import { RouteStrategy } from '../../types';
import { PathfindingResult } from './astar';

export function dijkstraPathfinding(
  graph: NavigationGraph,
  startNodeId: string,
  targetNodeId?: string,
  strategy: RouteStrategy = 'shortest'
): Map<string, PathfindingResult> {
  const results = new Map<string, PathfindingResult>();
  const startNode = graph.getNode(startNodeId);

  if (!startNode) {
    return results;
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const unvisited = new Set<string>();

  for (const node of graph.getAllNodes()) {
    dist.set(node.id, Infinity);
    unvisited.add(node.id);
  }

  dist.set(startNodeId, 0);

  let nodesVisited = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let smallestDist = Infinity;

    for (const nodeId of unvisited) {
      const d = dist.get(nodeId) ?? Infinity;
      if (d < smallestDist) {
        smallestDist = d;
        currentId = nodeId;
      }
    }

    if (!currentId || smallestDist === Infinity) {
      break;
    }

    unvisited.delete(currentId);
    nodesVisited++;

    // If we only care about a specific target and reached it, we can stop
    if (targetNodeId && currentId === targetNodeId) {
      break;
    }

    const neighbors = graph.getNeighborNodes(currentId);
    for (const { node: neighbor, edge } of neighbors) {
      if (!unvisited.has(neighbor.id)) continue;
      if (edge.isBlocked) continue;

      const edgeCost = graph.getEdgeCost(edge, strategy);
      if (edgeCost === Infinity) continue;

      const alt = (dist.get(currentId) || 0) + edgeCost;
      if (alt < (dist.get(neighbor.id) ?? Infinity)) {
        dist.set(neighbor.id, alt);
        prev.set(neighbor.id, currentId);
      }
    }
  }

  // Construct results for all reachable nodes or target
  const targetsToBuild = targetNodeId ? [targetNodeId] : graph.getAllNodes().map((n) => n.id);

  for (const tid of targetsToBuild) {
    const finalDist = dist.get(tid);
    if (finalDist !== undefined && finalDist !== Infinity) {
      const pathNodeIds: string[] = [tid];
      let curr = tid;
      while (prev.has(curr)) {
        curr = prev.get(curr)!;
        pathNodeIds.unshift(curr);
      }

      // Calculate actual geometric distance
      let totalDistance = 0;
      for (let i = 0; i < pathNodeIds.length - 1; i++) {
        const edge = graph.findEdgeBetween(pathNodeIds[i], pathNodeIds[i + 1]);
        if (edge) totalDistance += edge.distance;
      }

      results.set(tid, {
        found: true,
        pathNodeIds,
        totalDistance: Number(totalDistance.toFixed(2)),
        totalCost: Number(finalDist.toFixed(2)),
        nodesVisited,
        turnsCount: 0,
      });
    } else {
      results.set(tid, {
        found: false,
        pathNodeIds: [],
        totalDistance: 0,
        totalCost: Infinity,
        nodesVisited,
        turnsCount: 0,
      });
    }
  }

  return results;
}
