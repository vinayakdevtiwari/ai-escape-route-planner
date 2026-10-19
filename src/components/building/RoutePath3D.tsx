import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RouteResult } from '../../types';
import * as THREE from 'three';
import { getRouteArrowTexture } from '../../utils/proceduralTextures';

interface RoutePath3DProps {
  route: RouteResult | null;
  visible: boolean;
}

export const RoutePath3D: React.FC<RoutePath3DProps> = ({ route, visible }) => {
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  if (!textureRef.current) {
    textureRef.current = getRouteArrowTexture();
  }

  // Smooth forward chevron flow along route
  useFrame((_, delta) => {
    if (textureRef.current) {
      textureRef.current.offset.x -= delta * 1.5;
    }
  });

  if (!visible || !route || route.waypoints.length < 2) {
    return null;
  }

  const { waypoints, safetyScore } = route;

  // Glowing cyan ribbon (#22d3ee, emissive 2.0, bloom-enabled)
  const routeColor = safetyScore < 40 ? '#DC2626' : '#22D3EE';
  const emissiveColor = safetyScore < 40 ? '#DC2626' : '#22D3EE';

  // Generate ribbon segments along waypoints hovering 0.05 m above floor
  const ribbonSegments = useMemo(() => {
    const segments: {
      center: THREE.Vector3;
      length: number;
      angle: number;
    }[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = new THREE.Vector3(waypoints[i][0], 0.05, waypoints[i][2]);
      const p2 = new THREE.Vector3(waypoints[i + 1][0], 0.05, waypoints[i + 1][2]);
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const angle = Math.atan2(dir.x, dir.z);

      segments.push({ center, length: len, angle });
    }

    return segments;
  }, [waypoints]);

  const startPoint = waypoints[0];
  const exitPoint = waypoints[waypoints.length - 1];

  return (
    <group>
      {/* 1. GLOWING CYAN RIBBON (hovering 0.05m above floor, emissive 2.0) */}
      {ribbonSegments.map((seg, idx) => (
        <group
          key={`ribbon-${idx}`}
          position={[seg.center.x, seg.center.y, seg.center.z]}
          rotation={[0, seg.angle, 0]}
        >
          {/* Main glowing directional ribbon */}
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[seg.length, 0.46]} />
            <meshStandardMaterial
              map={textureRef.current!}
              color={routeColor}
              emissive={emissiveColor}
              emissiveIntensity={2.0}
              roughness={0.2}
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Under-glow halo ribbon */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
            <planeGeometry args={[0.56, seg.length]} />
            <meshBasicMaterial
              color="#22D3EE"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 2. WAYPOINT NODES */}
      {waypoints.map((wp, idx) => (
        <mesh
          key={`wp-${idx}`}
          position={[wp[0], 0.052, wp[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.2, 16]} />
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#22D3EE"
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* 3. EVACUATION ORIGIN / START PIN */}
      {startPoint && (
        <group position={[startPoint[0], 0.05, startPoint[2]]}>
          {/* Ground pulse ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[0.4, 0.65, 24]} />
            <meshBasicMaterial
              color="#22D3EE"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Floating Waypoint Pin */}
          <mesh position={[0, 0.65, 0]}>
            <coneGeometry args={[0.2, 0.65, 16]} />
            <meshStandardMaterial
              color="#22D3EE"
              emissive="#22D3EE"
              emissiveIntensity={2.2}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#22D3EE"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      )}

      {/* 4. DESTINATION EMERGENCY EXIT HALO */}
      {exitPoint && (
        <group position={[exitPoint[0], 0.05, exitPoint[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.95, 32]} />
            <meshBasicMaterial
              color="#16A34A"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[0.55, 32]} />
            <meshBasicMaterial
              color="#16A34A"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
