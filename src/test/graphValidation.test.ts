import { describe, it, expect } from 'vitest';
import { NavigationGraph } from '../engine/graph/navigationGraph';
import { validateNavigationGraph } from '../engine/graph/graphValidation';
import { sampleOfficeBuilding } from '../data/sampleBuildings';
import { NavNode } from '../types';

describe('Graph Validation Engine', () => {
  it('validates a complete, healthy building graph', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const result = validateNavigationGraph(graph, 'node-start', 'node-exit-west');

    expect(result.isValid).toBe(true);
    expect(result.canRoute).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.totalExits).toBeGreaterThanOrEqual(2);
    expect(result.reachableExitsFromStart.length).toBeGreaterThanOrEqual(1);
  });

  it('detects missing emergency exits', () => {
    // Strip exit flags
    const noExitNodes = sampleOfficeBuilding.nodes.map((n) => ({ ...n, isExit: false }));
    const graph = new NavigationGraph(noExitNodes, sampleOfficeBuilding.edges);
    const result = validateNavigationGraph(graph, 'node-start');

    expect(result.isValid).toBe(false);
    expect(result.canRoute).toBe(false);
    expect(result.errors.some((e) => e.includes('No emergency exits'))).toBe(true);
  });

  it('identifies disconnected orphan nodes', () => {
    const orphan: NavNode = {
      id: 'node-isolated',
      name: 'Isolated Penthouse Safe Room',
      x: 50,
      y: 0,
      z: 50,
      floor: 1,
      isExit: false,
      connectedNodeIds: [],
    };

    const graph = new NavigationGraph(
      [...sampleOfficeBuilding.nodes, orphan],
      sampleOfficeBuilding.edges
    );

    const result = validateNavigationGraph(graph, 'node-start');
    expect(result.warnings.some((w) => w.includes('isolated node'))).toBe(true);
  });
});
