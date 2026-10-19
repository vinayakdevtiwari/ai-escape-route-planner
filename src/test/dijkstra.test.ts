import { describe, it, expect } from 'vitest';
import { NavigationGraph } from '../engine/graph/navigationGraph';
import { dijkstraPathfinding } from '../engine/pathfinding/dijkstra';
import { sampleOfficeBuilding } from '../data/sampleBuildings';

describe("Dijkstra's Pathfinding Algorithm", () => {
  it('computes shortest path with accurate distances', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const results = dijkstraPathfinding(graph, 'node-start', 'node-exit-west', 'shortest');

    const result = results.get('node-exit-west');
    expect(result).toBeDefined();
    expect(result?.found).toBe(true);
    expect(result?.pathNodeIds).toEqual([
      'node-start',
      'node-corr-west',
      'node-corr-far-west',
      'node-exit-west',
    ]);
    expect(result?.totalDistance).toBeCloseTo(18.2, 1);
  });

  it('computes shortest distances to all building nodes simultaneously', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const results = dijkstraPathfinding(graph, 'node-start', undefined, 'shortest');

    expect(results.size).toBe(sampleOfficeBuilding.nodes.length);
    expect(results.get('node-exit-west')?.found).toBe(true);
    expect(results.get('node-exit-east')?.found).toBe(true);

    // West exit should be closer than East exit from node-start
    const westDist = results.get('node-exit-west')?.totalDistance || Infinity;
    const eastDist = results.get('node-exit-east')?.totalDistance || Infinity;
    expect(westDist).toBeLessThan(eastDist);
  });

  it('fails gracefully when all outgoing paths from a node are blocked', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    // Block the only edge exiting Office 101 (edge-1)
    graph.setEdgeBlocked('edge-1', true);

    const results = dijkstraPathfinding(graph, 'node-start', 'node-exit-west');
    const result = results.get('node-exit-west');
    expect(result?.found).toBe(false);
  });
});
