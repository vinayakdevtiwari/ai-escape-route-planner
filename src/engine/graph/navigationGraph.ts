import { NavNode, NavEdge, RouteStrategy, Hazard } from '../../types';

export class NavigationGraph {
  public nodes: Map<string, NavNode> = new Map();
  public edges: Map<string, NavEdge> = new Map();
  public adjacency: Map<string, string[]> = new Map(); // nodeId -> list of edgeIds

  constructor(nodes: NavNode[] = [], edges: NavEdge[] = []) {
    this.build(nodes, edges);
  }

  public build(nodes: NavNode[], edges: NavEdge[]): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();

    for (const node of nodes) {
      this.nodes.set(node.id, { ...node });
      this.adjacency.set(node.id, []);
    }

    for (const edge of edges) {
      // Ensure distance is computed if not present
      let dist = edge.distance;
      if (!dist || dist <= 0) {
        const n1 = this.nodes.get(edge.fromNodeId);
        const n2 = this.nodes.get(edge.toNodeId);
        if (n1 && n2) {
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        } else {
          dist = 1.0;
        }
      }

      const edgeCopy: NavEdge = { ...edge, distance: Number(dist.toFixed(2)) };
      this.edges.set(edge.id, edgeCopy);

      if (this.adjacency.has(edge.fromNodeId)) {
        this.adjacency.get(edge.fromNodeId)!.push(edge.id);
      }
      if (this.adjacency.has(edge.toNodeId)) {
        this.adjacency.get(edge.toNodeId)!.push(edge.id);
      }
    }
  }

  public getNode(id: string): NavNode | undefined {
    return this.nodes.get(id);
  }

  public getEdge(id: string): NavEdge | undefined {
    return this.edges.get(id);
  }

  public getConnectedEdges(nodeId: string): NavEdge[] {
    const edgeIds = this.adjacency.get(nodeId) || [];
    return edgeIds.map((eid) => this.edges.get(eid)!).filter(Boolean);
  }

  public getNeighborNodes(nodeId: string): { node: NavNode; edge: NavEdge }[] {
    const edges = this.getConnectedEdges(nodeId);
    const neighbors: { node: NavNode; edge: NavEdge }[] = [];

    for (const edge of edges) {
      const neighborId = edge.fromNodeId === nodeId ? edge.toNodeId : edge.fromNodeId;
      const neighbor = this.nodes.get(neighborId);
      if (neighbor) {
        neighbors.push({ node: neighbor, edge });
      }
    }
    return neighbors;
  }

  public findEdgeBetween(nodeAId: string, nodeBId: string): NavEdge | undefined {
    const edges = this.adjacency.get(nodeAId) || [];
    for (const eid of edges) {
      const edge = this.edges.get(eid);
      if (
        edge &&
        ((edge.fromNodeId === nodeAId && edge.toNodeId === nodeBId) ||
          (edge.fromNodeId === nodeBId && edge.toNodeId === nodeAId))
      ) {
        return edge;
      }
    }
    return undefined;
  }

  public getEdgeCost(edge: NavEdge, strategy: RouteStrategy): number {
    if (edge.isBlocked) {
      return Infinity;
    }

    const baseDistance = edge.distance;
    const penalty = edge.hazardPenalty || 0;

    switch (strategy) {
      case 'shortest':
        // Shortest route strictly minimizes distance, but will avoid active 100% blocked hazards
        return penalty >= 95 ? Infinity : baseDistance + penalty * 0.1;

      case 'safest':
        // Safest route strongly penalizes any hazard exposure
        if (penalty > 0) {
          return baseDistance + penalty * 8.0;
        }
        return baseDistance;

      case 'balanced':
      default:
        // Balanced balances distance and hazard risk
        if (penalty > 0) {
          return baseDistance + penalty * 2.5;
        }
        return baseDistance;
    }
  }

  /**
   * Recalculate dynamic hazard penalties on all edges based on active hazards
   */
  public updateHazardPenalties(hazards: Hazard[]): void {
    // Reset all penalties
    for (const edge of this.edges.values()) {
      edge.hazardPenalty = 0;
    }

    const activeHazards = hazards.filter((h) => h.active);
    if (activeHazards.length === 0) return;

    for (const edge of this.edges.values()) {
      const n1 = this.nodes.get(edge.fromNodeId);
      const n2 = this.nodes.get(edge.toNodeId);
      if (!n1 || !n2) continue;

      // Midpoint of edge in 3D
      const mx = (n1.x + n2.x) / 2;
      const my = (n1.y + n2.y) / 2;
      const mz = (n1.z + n2.z) / 2;

      let highestPenalty = 0;

      for (const hazard of activeHazards) {
        const [hx, hy, hz] = hazard.position;
        // Euclidean distance to hazard center
        const dx = mx - hx;
        const dy = (my - hy) * 2; // Floor difference penalty is higher
        const dz = mz - hz;
        const distToHazard = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distToHazard <= hazard.radius) {
          // Inside hazard radius
          const proximity = 1 - distToHazard / hazard.radius;
          let calculatedPenalty = 0;

          if (hazard.type === 'fire') {
            // Fire has high damage penalty
            calculatedPenalty = hazard.intensity * proximity * 1.5;
            if (hazard.intensity >= 80 && distToHazard < hazard.radius * 0.6) {
              // Extreme fire makes corridor impassable
              calculatedPenalty = 100;
            }
          } else if (hazard.type === 'flood') {
            // Flood has moderate movement penalty and blocks at high water levels
            calculatedPenalty = hazard.intensity * proximity * 0.9;
            if (hazard.intensity >= 90) {
              calculatedPenalty = 100;
            }
          } else if (hazard.type === 'blocked') {
            // Explicit corridor block
            calculatedPenalty = 100;
          }

          if (calculatedPenalty > highestPenalty) {
            highestPenalty = calculatedPenalty;
          }
        }
      }

      edge.hazardPenalty = Math.min(100, Math.round(highestPenalty));
    }
  }

  public setEdgeBlocked(edgeId: string, blocked: boolean): void {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.isBlocked = blocked;
    }
  }

  public getAllNodes(): NavNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): NavEdge[] {
    return Array.from(this.edges.values());
  }

  public getExitNodes(): NavNode[] {
    return this.getAllNodes().filter((n) => n.isExit);
  }
}
