import { NavigationGraph } from './navigationGraph';
import { NavNode } from '../../types';

export interface GraphValidationResult {
  isValid: boolean;
  canRoute: boolean;
  errors: string[];
  warnings: string[];
  totalNodes: number;
  totalEdges: number;
  totalExits: number;
  reachableExitsFromStart: NavNode[];
}

export function validateNavigationGraph(
  graph: NavigationGraph,
  startNodeId?: string,
  targetExitNodeId?: string
): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allNodes = graph.getAllNodes();
  const allEdges = graph.getAllEdges();
  const exitNodes = graph.getExitNodes();

  if (allNodes.length === 0) {
    errors.push('The building has no navigation nodes defined.');
    return {
      isValid: false,
      canRoute: false,
      errors,
      warnings,
      totalNodes: 0,
      totalEdges: 0,
      totalExits: 0,
      reachableExitsFromStart: [],
    };
  }

  if (exitNodes.length === 0) {
    errors.push('No emergency exits found in the building configuration.');
  }

  // Check start node
  let startNode: NavNode | undefined;
  if (startNodeId) {
    startNode = graph.getNode(startNodeId);
    if (!startNode) {
      errors.push(`Selected starting point "${startNodeId}" does not exist in graph.`);
    }
  } else {
    warnings.push('No starting node currently selected.');
  }

  // Check target exit if specified
  if (targetExitNodeId) {
    const exitNode = graph.getNode(targetExitNodeId);
    if (!exitNode) {
      errors.push(`Target exit "${targetExitNodeId}" does not exist.`);
    } else if (!exitNode.isExit) {
      errors.push(`Specified target "${targetExitNodeId}" is not designated as an emergency exit.`);
    }
  }

  // Check orphan nodes (nodes with 0 connected edges)
  const orphanNodes = allNodes.filter((node) => {
    const edges = graph.getConnectedEdges(node.id);
    return edges.length === 0;
  });

  if (orphanNodes.length > 0) {
    warnings.push(
      `${orphanNodes.length} isolated node(s) found without any connections (${orphanNodes.map((n) => n.name).slice(0, 3).join(', ')}${orphanNodes.length > 3 ? '...' : ''}).`
    );
  }

  // Check reachability from start node to any exit using BFS
  const reachableExits: NavNode[] = [];

  if (startNode) {
    const visited = new Set<string>();
    const queue: string[] = [startNode.id];
    visited.add(startNode.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = graph.getNode(currentId);

      if (currentNode && currentNode.isExit) {
        reachableExits.push(currentNode);
      }

      const neighbors = graph.getNeighborNodes(currentId);
      for (const { node, edge } of neighbors) {
        // We consider an edge traversable if not strictly blocked
        if (!edge.isBlocked && !visited.has(node.id)) {
          visited.add(node.id);
          queue.push(node.id);
        }
      }
    }

    if (reachableExits.length === 0 && exitNodes.length > 0) {
      warnings.push(
        'Warning: No emergency exit is currently accessible from the starting point due to blocked corridors or disconnected graph sections.'
      );
    }
  }

  const isValid = errors.length === 0;
  const canRoute = isValid && reachableExits.length > 0;

  return {
    isValid,
    canRoute,
    errors,
    warnings,
    totalNodes: allNodes.length,
    totalEdges: allEdges.length,
    totalExits: exitNodes.length,
    reachableExitsFromStart: reachableExits,
  };
}
