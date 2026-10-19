import { describe, it, expect } from 'vitest';
import { NavigationGraph } from '../engine/graph/navigationGraph';
import { planRoute } from '../engine/pathfinding/routePlanner';
import { sampleOfficeBuilding } from '../data/sampleBuildings';
import { stepEvacuationSimulation } from '../engine/simulation/evacuationEngine';
import { EvacuationSimState } from '../types';

describe('Dynamic Route Recalculation & Simulation', () => {
  it('automatically diverts to alternative exit when primary exit becomes blocked', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);

    // Initial plan without specifying exit (auto-detects closest, which is West exit)
    const initialPlan = planRoute(graph, {
      startNodeId: 'node-start',
      strategy: 'shortest',
    });

    expect(initialPlan.route.pathNodeIds.length).toBeGreaterThan(0);
    expect(initialPlan.route.exitNodeId).toBe('node-exit-west');

    // Now block West Exit corridor (edge-4)
    graph.setEdgeBlocked('edge-4', true);

    // Recalculate route
    const reroutedPlan = planRoute(graph, {
      startNodeId: 'node-start',
      strategy: 'shortest',
      recalculatedDueTo: 'West exit corridor blocked by structural debris',
    });

    // It should automatically switch to East exit!
    expect(reroutedPlan.route.pathNodeIds.length).toBeGreaterThan(0);
    expect(reroutedPlan.route.exitNodeId).toBe('node-exit-east');
    expect(reroutedPlan.route.pathNodeIds).toContain('node-exit-east');
    expect(reroutedPlan.route.explanation).toContain('dynamically recalculated');
    expect(reroutedPlan.route.detailedAnalysis.length).toBeGreaterThan(0);
  });

  it('evacuation engine halts and requests reroute when path ahead is blocked mid-transit', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);
    const plan = planRoute(graph, {
      startNodeId: 'node-start',
      strategy: 'shortest',
    });

    const simState: EvacuationSimState = {
      status: 'running',
      currentPosition: plan.route.waypoints[0],
      targetPosition: plan.route.waypoints[1],
      currentNodeIndex: 0,
      progressPercent: 0,
      distanceTraveled: 0,
      distanceRemaining: plan.route.totalDistance,
      elapsedTime: 0,
      estimatedRemainingTime: plan.route.estimatedTimeSeconds,
      evacueeSpeed: 1.4,
      speedMultiplier: 1.0,
      currentHazardExposure: 0,
      activePathNodeIds: plan.route.pathNodeIds,
    };

    // Before movement, block the next edge on the path (edge-1)
    graph.setEdgeBlocked('edge-1', true);

    const stepResult = stepEvacuationSimulation(simState, plan.route, graph, 0.5);

    expect(stepResult.nextState.status).toBe('blocked_halted');
    expect(stepResult.recalculationRequested).toBe(true);
    expect(stepResult.recalculationReason).toBeDefined();
  });

  it('handles scenario where all exits are completely blocked', () => {
    const graph = new NavigationGraph(sampleOfficeBuilding.nodes, sampleOfficeBuilding.edges);

    // Block both exits
    graph.setEdgeBlocked('edge-4', true); // blocks west exit
    graph.setEdgeBlocked('edge-9', true); // blocks east exit

    const plan = planRoute(graph, {
      startNodeId: 'node-start',
      strategy: 'shortest',
    });

    expect(plan.route.pathNodeIds).toHaveLength(0);
    expect(plan.route.safetyScore).toBe(0);
    expect(plan.route.explanation).toContain('CRITICAL');
  });
});
