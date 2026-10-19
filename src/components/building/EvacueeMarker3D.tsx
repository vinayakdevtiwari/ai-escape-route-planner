import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EvacuationSimState } from '../../types';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface EvacueeMarker3DProps {
  simState: EvacuationSimState;
}

export const EvacueeMarker3D: React.FC<EvacueeMarker3DProps> = ({ simState }) => {
  const evacueeGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const [x, y, z] = simState.currentPosition;
  const isRunning = simState.status === 'running';
  const isHalted = simState.status === 'blocked_halted';
  const isCompleted = simState.status === 'completed';

  let angle = 0;
  if (simState.targetPosition) {
    const dx = simState.targetPosition[0] - x;
    const dz = simState.targetPosition[2] - z;
    angle = Math.atan2(dx, dz);
  }

  // Smooth walk cycle animation in useFrame
  useFrame(({ clock }) => {
    if (isRunning) {
      const walkCycle = Math.sin(clock.getElapsedTime() * 9 * simState.speedMultiplier);
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = walkCycle * 0.42;
        rightLegRef.current.rotation.x = -walkCycle * 0.42;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -walkCycle * 0.38;
        rightArmRef.current.rotation.x = walkCycle * 0.38;
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  const statusDot = isHalted
    ? 'bg-red-500'
    : isCompleted
    ? 'bg-emerald-400'
    : isRunning
    ? 'bg-amber-400 animate-ping'
    : 'bg-amber-400';

  return (
    <group position={[x, y, z]} rotation={[0, angle, 0]} ref={evacueeGroupRef}>
      {/* Ground Pulse Halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.35, 0.52, 24]} />
        <meshBasicMaterial
          color={isHalted ? '#DC2626' : isCompleted ? '#16A34A' : '#F59E0B'}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Low-Poly Stylized Human Figure (Orange #F59E0B body for high isometric visibility) */}
      <group position={[0, 0, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>

        {/* Torso: Vibrant Orange (#F59E0B) */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.36, 0.42, 0.24]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#F59E0B"
            emissiveIntensity={0.25}
            roughness={0.4}
          />
        </mesh>

        {/* High-Vis Silver Reflective Strips */}
        <mesh position={[0, 1.15, 0.125]}>
          <planeGeometry args={[0.34, 0.07]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Head with Protective Helmet */}
        <group position={[0, 1.52, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </mesh>
          {/* Visor */}
          <mesh position={[0, 0.02, 0.11]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.16, 0.06, 0.07]} />
            <meshStandardMaterial color="#0284C7" roughness={0.2} />
          </mesh>
        </group>

        {/* Emergency Kit Backpack */}
        <mesh position={[0, 1.16, -0.16]} castShadow>
          <boxGeometry args={[0.24, 0.32, 0.12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>

        {/* Left Arm (Orange #F59E0B) */}
        <group ref={leftArmRef} position={[-0.22, 1.32, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.42, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.44, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
          </mesh>
        </group>

        {/* Right Arm (Orange #F59E0B) */}
        <group ref={rightArmRef} position={[0.22, 1.32, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.42, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.44, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
          </mesh>
        </group>

        {/* Left Leg (Dark Graphite #1E293B) */}
        <group ref={leftLegRef} position={[-0.09, 0.8, 0]}>
          <mesh position={[0, -0.36, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.74, 8]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.76, 0.05]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>

        {/* Right Leg (Dark Graphite #1E293B) */}
        <group ref={rightLegRef} position={[0.09, 0.8, 0]}>
          <mesh position={[0, -0.36, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.74, 8]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.76, 0.05]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* High-Contrast Floating Status Pill */}
      <Html position={[0, 2.1, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-xl flex items-center gap-1.5 bg-[#0A0F1C]/90 text-amber-300 border border-amber-500/60 backdrop-blur-md">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          <span>
            {isHalted
              ? 'HALTED (PATH BLOCKED)'
              : isCompleted
              ? 'EVACUATED'
              : isRunning
              ? `EVACUATING (${simState.progressPercent}%)`
              : 'READY TO EVACUATE'}
          </span>
        </div>
      </Html>
    </group>
  );
};
