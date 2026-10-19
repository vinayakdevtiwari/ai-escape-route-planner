import { describe, it, expect } from 'vitest';
import { NavigationGraph } from '../engine/graph/navigationGraph';
import { astarPathfinding } from '../engine/pathfinding/astar';
import { sampleOfficeBuilding } from '../data/sampleBuildings';

describe('A* Pathfinding Algorithm', () => {
  it('finds valid route from starting office to west emergency exit', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const result = astarPathfinding(graph, 'node-start', 'node-exit-west', 'shortest');

    expect(result.found).toBe(true);
    expect(result.pathNodeIds.length).toBeGreaterThan(1);
    expect(result.pathNodeIds[0]).toBe('node-start');
    expect(result.pathNodeIds[result.pathNodeIds.length - 1]).toBe('node-exit-west');
    expect(result.totalDistance).toBeGreaterThan(0);
  });

  it('respects blocked corridors and finds alternative route or reports unreachable', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);

    // Block the only direct edge to West exit (edge-4)
    graph.setEdgeBlocked('edge-4', true);

    const result = astarPathfinding(graph, 'node-start', 'node-exit-west', 'shortest');
    // Since edge-4 was the only edge to West Exit, it must not be found
    expect(result.found).toBe(false);
    expect(result.pathNodeIds).toHaveLength(0);

    // But East Exit should still be reachable!
    const eastResult = astarPathfinding(graph, 'node-start', 'node-exit-east', 'shortest');
    expect(eastResult.found).toBe(true);
    expect(eastResult.pathNodeIds[eastResult.pathNodeIds.length - 1]).toBe('node-exit-east');
  });

  it('selects safer path over high-hazard path when strategy is safest', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);

    // Place high hazard penalty on edge-2 (corridor towards west)
    const edge2 = graph.getEdge('edge-2');
    if (edge2) {
      edge2.hazardPenalty = 90;
    }

    const safestPlan = astarPathfinding(graph, 'node-start', 'node-exit-east', 'safest');
    expect(safestPlan.found).toBe(true);
    // Path should avoid edge-2
    expect(safestPlan.pathNodeIds).not.toContain('node-corr-far-west');
  });

  it('handles start node matching target node', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const result = astarPathfinding(graph, 'node-start', 'node-start', 'shortest');
    expect(result.found).toBe(true);
    expect(result.pathNodeIds).toEqual(['node-start']);
    expect(result.totalDistance).toBe(0);
  });

  it('returns failure for non-existent nodes', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const result = astarPathfinding(graph, 'non-existent-start', 'node-exit-west');
    expect(result.found).toBe(false);
  });
});
