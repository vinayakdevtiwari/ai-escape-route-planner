import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Hazard } from '../../types';
import * as THREE from 'three';

interface HazardMesh3DProps {
  hazards: Hazard[];
  onSelectHazard?: (hazardId: string) => void;
}

export const HazardMesh3D: React.FC<HazardMesh3DProps> = ({ hazards, onSelectHazard }) => {
  const activeHazards = hazards.filter((h) => h.active);

  return (
    <group>
      {activeHazards.map((hazard) => {
        if (hazard.type === 'fire') {
          return (
            <FireHazardMesh
              key={hazard.id}
              hazard={hazard}
              onClick={() => onSelectHazard?.(hazard.id)}
            />
          );
        } else if (hazard.type === 'flood') {
          return (
            <FloodHazardMesh
              key={hazard.id}
              hazard={hazard}
              onClick={() => onSelectHazard?.(hazard.id)}
            />
          );
        } else {
          return (
            <BlockedCorridorMesh
              key={hazard.id}
              hazard={hazard}
              onClick={() => onSelectHazard?.(hazard.id)}
            />
          );
        }
      })}
    </group>
  );
};

const FireHazardMesh: React.FC<{ hazard: Hazard; onClick: () => void }> = ({ hazard, onClick }) => {
  const flameGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 7;
    if (flameGroupRef.current) {
      flameGroupRef.current.children.forEach((child, i) => {
        child.scale.y = 1 + Math.sin(t + i * 1.5) * 0.25;
        child.rotation.y = t * 0.15 + i;
      });
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 1.5) * 0.4;
    }
  });

  const [x, y, z] = hazard.position;
  const radius = Math.max(1, hazard.radius);
  const scale = 0.5 + (hazard.intensity / 100) * 0.7;

  return (
    <group position={[x, y, z]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Soft warm light */}
      <pointLight ref={lightRef} color="#EA580C" distance={radius * 1.8} intensity={1.8} />

      {/* Red Danger Zone Perimeter on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[radius * 0.95, radius, 32]} />
        <meshBasicMaterial color="#DC2626" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#DC2626" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Stylized Flame Cones */}
      <group ref={flameGroupRef} position={[0, 0, 0]} scale={[scale, scale, scale]}>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.45, 1.5, 8]} />
          <meshStandardMaterial color="#EA580C" emissive="#DC2626" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.25, 0.6, 0.18]}>
          <coneGeometry args={[0.3, 1.1, 8]} />
          <meshStandardMaterial color="#F59E0B" emissive="#EA580C" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.25, 0.5, -0.18]}>
          <coneGeometry args={[0.28, 0.9, 8]} />
          <meshStandardMaterial color="#DC2626" emissive="#991B1B" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

const FloodHazardMesh: React.FC<{ hazard: Hazard; onClick: () => void }> = ({ hazard, onClick }) => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waterRef.current) {
      waterRef.current.position.y = 0.06 + Math.sin(t * 2.5) * 0.015;
    }
  });

  const [x, y, z] = hazard.position;
  const radius = Math.max(1, hazard.radius);

  return (
    <group position={[x, y, z]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Translucent water plane */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial
          color="#0284C7"
          roughness={0.15}
          metalness={0.5}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flood Perimeter Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[radius * 0.96, radius, 32]} />
        <meshBasicMaterial color="#2563EB" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const BlockedCorridorMesh: React.FC<{ hazard: Hazard; onClick: () => void }> = ({ hazard, onClick }) => {
  const [x, y, z] = hazard.position;

  return (
    <group position={[x, y, z]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Safety barrier */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.3]} />
        <meshStandardMaterial color="#DC2626" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#EA580C" emissive="#EA580C" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};
