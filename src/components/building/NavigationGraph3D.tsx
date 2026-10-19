import React from 'react';
import { NavNode, NavEdge } from '../../types';
import * as THREE from 'three';

interface NavigationGraph3DProps {
  nodes: NavNode[];
  edges: NavEdge[];
  startNodeId?: string;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  onToggleEdgeBlocked?: (edgeId: string) => void;
}

export const NavigationGraph3D: React.FC<NavigationGraph3DProps> = ({
  nodes,
  edges,
  startNodeId,
  selectedNodeId,
  onSelectNode,
  onToggleEdgeBlocked,
}) => {
  const nodeMap = new Map<string, NavNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  return (
    <group position={[0, 0.12, 0]}>
      {/* Corridor Connections */}
      {edges.map((edge) => {
        const from = nodeMap.get(edge.fromNodeId);
        const to = nodeMap.get(edge.toNodeId);
        if (!from || !to) return null;

        const points = [
          new THREE.Vector3(from.x, from.y, from.z),
          new THREE.Vector3(to.x, to.y, to.z),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        const isBlocked = edge.isBlocked;
        const hasHazard = (edge.hazardPenalty || 0) > 30;

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const midZ = (from.z + to.z) / 2;

        return (
          <group key={edge.id}>
            <primitive
              object={
                new THREE.Line(
                  lineGeometry,
                  new THREE.LineBasicMaterial({
                    color: isBlocked ? '#DC2626' : hasHazard ? '#EA580C' : '#94A3B8',
                    transparent: true,
                    opacity: isBlocked ? 0.95 : hasHazard ? 0.75 : 0.4,
                    linewidth: isBlocked ? 3 : 1,
                  })
                )
              }
            />

            {/* Blocked Barrier Marker */}
            {isBlocked && (
              <group
                position={[midX, midY + 0.35, midZ]}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEdgeBlocked?.(edge.id);
                }}
              >
                <mesh castShadow>
                  <boxGeometry args={[0.75, 0.4, 0.18]} />
                  <meshStandardMaterial color="#DC2626" roughness={0.4} />
                </mesh>
                <mesh position={[0, 0, 0.1]}>
                  <planeGeometry args={[0.65, 0.28]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isStart = node.id === startNodeId;
        const isExit = node.isExit;
        const isSelected = node.id === selectedNodeId;

        const color = isExit
          ? '#16A34A'
          : isStart
          ? '#EA580C'
          : isSelected
          ? '#2563EB'
          : '#64748B';
        const size = isExit ? 0.28 : isStart ? 0.26 : isSelected ? 0.24 : 0.15;

        return (
          <group
            key={node.id}
            position={[node.x, node.y, node.z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode?.(node.id);
            }}
          >
            <mesh castShadow>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={color}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>

            {(isExit || isStart || isSelected) && (
              <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size + 0.08, size + 0.18, 24]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
