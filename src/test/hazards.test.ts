import { describe, it, expect } from 'vitest';
import { NavigationGraph } from '../engine/graph/navigationGraph';
import { updateHazardSimulationStep, createNewHazard } from '../engine/hazards/hazardEngine';
import { sampleOfficeBuilding } from '../data/sampleBuildings';
import { Hazard } from '../types';

describe('Hazard Simulation Engine', () => {
  it('correctly calculates proximity-based hazard penalties on nearby edges', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);

    // Create a fire hazard right at node-corr-west (-8, 0, 0)
    const fire = createNewHazard('fire', [-8, 0, 0], 80, 5.0, 1.0);
    graph.updateHazardPenalties([fire]);

    // Edges connected to or passing near (-8, 0, 0) should have high hazard penalty
    const edge1 = graph.getEdge('edge-1'); // node-start to node-corr-west
    const edge2 = graph.getEdge('edge-2'); // node-corr-west to node-corr-far-west
    const edge9 = graph.getEdge('edge-9'); // node-corr-east to node-exit-east (far away at x=16)

    expect(edge1?.hazardPenalty).toBeGreaterThan(0);
    expect(edge2?.hazardPenalty).toBeGreaterThan(0);
    expect(edge9?.hazardPenalty).toBe(0); // Far away should have zero penalty
  });

  it('spreads and increases fire intensity over simulation delta time', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const initialHazard: Hazard = {
      id: 'test-fire',
      type: 'fire',
      position: [0, 0, 0],
      radius: 4.0,
      intensity: 50,
      spreadSpeed: 2.0,
      active: true,
      startTime: Date.now(),
    };

    const result = updateHazardSimulationStep([initialHazard], graph, 2.0, 1.0);
    const updated = result.updatedHazards[0];

    expect(updated.intensity).toBeGreaterThan(50);
    expect(updated.radius).toBeGreaterThan(4.0);
    expect(result.hazardIncreased).toBe(true);
  });

  it('automatically triggers corridor blocking when hazard intensity reaches extreme threshold', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    // Extreme fire right on edge-5 midpoint (-4, 0, 0)
    const extremeFire: Hazard = {
      id: 'inferno',
      type: 'fire',
      position: [-4, 0, 0],
      radius: 8.0,
      intensity: 98,
      spreadSpeed: 1.0,
      active: true,
      startTime: Date.now(),
    };

    const result = updateHazardSimulationStep([extremeFire], graph, 1.0, 1.0);
    const edge5 = graph.getEdge('edge-5');

    expect(edge5?.isBlocked).toBe(true);
    expect(result.corridorsBlockedByHazards).toContain('edge-5');
  });
});
