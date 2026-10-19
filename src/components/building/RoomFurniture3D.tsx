import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPresentationDisplayTexture } from '../../utils/proceduralTextures';

// ==========================================
// DESK + COMPUTER + CHAIR
// ==========================================
export const OfficeWorkstation: React.FC<{
  position: [number, number, number];
  rotation?: number;
  isExecutive?: boolean;
}> = ({ position, rotation = 0, isExecutive = false }) => {
  const deskWidth = isExecutive ? 2.3 : 1.6;
  const deskDepth = isExecutive ? 0.95 : 0.8;
  const deskHeight = 0.74;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk Top: darker, desaturated wood #6b4f3a */}
      <mesh position={[0, deskHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskWidth, 0.04, deskDepth]} />
        <meshStandardMaterial
          color="#6B4F3A"
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Desk Legs (Dark Graphite Steel #1F242E) */}
      <mesh position={[-deskWidth / 2 + 0.05, deskHeight / 2, -deskDepth / 2 + 0.05]} castShadow>
        <boxGeometry args={[0.05, deskHeight, 0.05]} />
        <meshStandardMaterial color="#1F242E" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[deskWidth / 2 - 0.05, deskHeight / 2, -deskDepth / 2 + 0.05]} castShadow>
        <boxGeometry args={[0.05, deskHeight, 0.05]} />
        <meshStandardMaterial color="#1F242E" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[-deskWidth / 2 + 0.05, deskHeight / 2, deskDepth / 2 - 0.05]} castShadow>
        <boxGeometry args={[0.05, deskHeight, 0.05]} />
        <meshStandardMaterial color="#1F242E" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[deskWidth / 2 - 0.05, deskHeight / 2, deskDepth / 2 - 0.05]} castShadow>
        <boxGeometry args={[0.05, deskHeight, 0.05]} />
        <meshStandardMaterial color="#1F242E" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Monitor Display: Black with emissive screen */}
      <group position={[0, deskHeight + 0.02, -deskDepth / 4]}>
        {/* Base */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.15]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Post */}
        <mesh position={[0, 0.14, -0.04]}>
          <boxGeometry args={[0.035, 0.26, 0.035]} />
          <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Bezel (Black) */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.62, 0.36, 0.025]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Screen (Black with emissive blue glow) */}
        <mesh position={[0, 0.25, 0.015]}>
          <planeGeometry args={[0.59, 0.33]} />
          <meshStandardMaterial
            color="#0A192F"
            emissive="#0284C7"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Keyboard & Mouse */}
      <mesh position={[0, deskHeight + 0.025, 0.12]}>
        <boxGeometry args={[0.4, 0.012, 0.13]} />
        <meshStandardMaterial color="#1F2937" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, deskHeight + 0.025, 0.12]}>
        <boxGeometry args={[0.065, 0.018, 0.1]} />
        <meshStandardMaterial color="#374151" roughness={0.5} />
      </mesh>

      {/* Ergonomic Office Chair: chairs #2b2f38 */}
      <group position={[0, 0, 0.58]}>
        {/* Wheel Base */}
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 8]} />
          <meshStandardMaterial color="#111827" metalness={0.8} />
        </mesh>
        {/* Center post */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Seat Cushion #2b2f38 */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.46, 0.07, 0.44]} />
          <meshStandardMaterial
            color="#2B2F38"
            roughness={0.85}
          />
        </mesh>
        {/* Mesh Backrest #2b2f38 */}
        <mesh position={[0, 0.7, 0.18]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.5, 0.05]} />
          <meshStandardMaterial
            color="#2B2F38"
            roughness={0.85}
          />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// EXECUTIVE SOFA & COFFEE TABLE
// ==========================================
export const ExecutiveLoungeSet: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  return (
    <group position={position}>
      {/* 3-Seater Dark Leather Sofa */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[1.9, 0.22, 0.8]} />
          <meshStandardMaterial color="#2B2F38" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, -0.04]} castShadow>
          <boxGeometry args={[1.65, 0.15, 0.62]} />
          <meshStandardMaterial color="#374151" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.62, -0.32]} castShadow>
          <boxGeometry args={[1.9, 0.42, 0.16]} />
          <meshStandardMaterial color="#2B2F38" roughness={0.7} />
        </mesh>
        <mesh position={[-0.88, 0.42, 0]} castShadow>
          <boxGeometry args={[0.16, 0.32, 0.8]} />
          <meshStandardMaterial color="#2B2F38" roughness={0.7} />
        </mesh>
        <mesh position={[0.88, 0.42, 0]} castShadow>
          <boxGeometry args={[0.16, 0.32, 0.8]} />
          <meshStandardMaterial color="#2B2F38" roughness={0.7} />
        </mesh>
      </group>

      {/* Coffee Table: Dark Wood #6b4f3a */}
      <group position={[0, 0, 1.1]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[1.1, 0.035, 0.55]} />
          <meshStandardMaterial color="#6B4F3A" roughness={0.5} />
        </mesh>
        {[-0.45, 0.45].map((x, xi) =>
          [-0.2, 0.2].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.11, z]}>
              <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
              <meshStandardMaterial color="#1F2937" metalness={0.8} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
};

// ==========================================
// DATACENTER SERVER RACK WITH STATUS LEDs
// ==========================================
export const ServerRackUnit: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const ledsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ledsRef.current) {
      const t = clock.getElapsedTime() * 8;
      ledsRef.current.children.forEach((child: any, idx) => {
        if (child.material) {
          const blink = Math.sin(t + idx * 1.8) > 0.1;
          child.material.emissiveIntensity = blink ? 1.6 : 0.2;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* 42U Server Rack (Deep Dark Steel #111827) */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 2.2, 0.88]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Front Perforated Vent Panel */}
      <mesh position={[0, 1.1, 0.45]}>
        <planeGeometry args={[0.72, 2.1]} />
        <meshStandardMaterial color="#1F2937" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Subtle LED Status Array */}
      <group ref={ledsRef} position={[0, 1.1, 0.455]}>
        {[-0.75, -0.35, 0.05, 0.45, 0.8].map((yOffset, i) => (
          <React.Fragment key={i}>
            <mesh position={[-0.24, yOffset, 0]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshStandardMaterial
                color="#16A34A"
                emissive="#16A34A"
                emissiveIntensity={1.2}
              />
            </mesh>
            <mesh position={[-0.19, yOffset, 0]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshStandardMaterial
                color="#0284C7"
                emissive="#0284C7"
                emissiveIntensity={1.2}
              />
            </mesh>
            <mesh position={[-0.14, yOffset, 0]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshStandardMaterial
                color="#EA580C"
                emissive="#EA580C"
                emissiveIntensity={0.9}
              />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    </group>
  );
};

// ==========================================
// CONFERENCE ROOM TABLE + CHAIRS + DISPLAY
// ==========================================
export const ConferenceFurniture: React.FC<{
  position: [number, number, number];
  roomWidth: number;
  roomDepth: number;
}> = ({ position, roomDepth }) => {
  const tableLength = 4.2;
  const tableWidth = 1.35;
  const displayTexture = getPresentationDisplayTexture();

  return (
    <group position={position}>
      {/* Boardroom Table: Dark Wood #3b2a20 */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[tableLength, 0.05, tableWidth]} />
        <meshStandardMaterial
          color="#3B2A20"
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>
      {/* Pedestal Bases */}
      <mesh position={[-1.25, 0.37, 0]} castShadow>
        <boxGeometry args={[0.28, 0.74, 0.75]} />
        <meshStandardMaterial color="#1F242E" metalness={0.7} />
      </mesh>
      <mesh position={[1.25, 0.37, 0]} castShadow>
        <boxGeometry args={[0.28, 0.74, 0.75]} />
        <meshStandardMaterial color="#1F242E" metalness={0.7} />
      </mesh>

      {/* 12 Conference Chairs (#2b2f38) */}
      {[-1.6, -0.8, 0, 0.8, 1.6].map((xOffset, idx) => (
        <React.Fragment key={idx}>
          {/* North chairs */}
          <group position={[xOffset, 0, -tableWidth / 2 - 0.32]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.42, 0.05, 0.4]} />
              <meshStandardMaterial color="#2B2F38" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.68, -0.17]} castShadow>
              <boxGeometry args={[0.4, 0.46, 0.04]} />
              <meshStandardMaterial color="#1F242E" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.21, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
              <meshStandardMaterial color="#4B5563" metalness={0.8} />
            </mesh>
          </group>

          {/* South chairs */}
          <group position={[xOffset, 0, tableWidth / 2 + 0.32]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.42, 0.05, 0.4]} />
              <meshStandardMaterial color="#2B2F38" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.68, -0.17]} castShadow>
              <boxGeometry args={[0.4, 0.46, 0.04]} />
              <meshStandardMaterial color="#1F242E" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.21, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
              <meshStandardMaterial color="#4B5563" metalness={0.8} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Head Chairs (East & West) */}
      <group position={[-tableLength / 2 - 0.35, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.42, 0.05, 0.4]} />
          <meshStandardMaterial color="#2B2F38" />
        </mesh>
        <mesh position={[0, 0.68, -0.17]} castShadow>
          <boxGeometry args={[0.4, 0.46, 0.04]} />
          <meshStandardMaterial color="#1F242E" />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.8} />
        </mesh>
      </group>

      <group position={[tableLength / 2 + 0.35, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.42, 0.05, 0.4]} />
          <meshStandardMaterial color="#2B2F38" />
        </mesh>
        <mesh position={[0, 0.68, -0.17]} castShadow>
          <boxGeometry args={[0.4, 0.46, 0.04]} />
          <meshStandardMaterial color="#1F242E" />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.8} />
        </mesh>
      </group>

      {/* Presentation Video Screen on Wall */}
      <group position={[0, 1.8, -roomDepth / 2 + 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[3.0, 1.6, 0.06]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[2.85, 1.45]} />
          <meshBasicMaterial map={displayTexture} />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// CAFETERIA & LOUNGE FURNITURE
// ==========================================
export const CafeteriaFurniture: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  return (
    <group position={position}>
      {/* Service Counter (Dark slate & Quartz) */}
      <group position={[0, 0, -2.1]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.0, 0.9, 0.85]} />
          <meshStandardMaterial color="#1F242E" roughness={0.5} />
        </mesh>
        {/* Quartz Top */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[4.2, 0.05, 0.9]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.25} metalness={0.05} />
        </mesh>
        {/* Espresso Machine */}
        <mesh position={[-1.1, 1.15, 0]} castShadow>
          <boxGeometry args={[0.5, 0.38, 0.36]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* Cafe Dining Table 1: Dark base with wood top */}
      <group position={[-1.3, 0, 1.1]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.035, 24]} />
          <meshStandardMaterial color="#6B4F3A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.72, 8]} />
          <meshStandardMaterial color="#1F2937" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.035, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.8} />
        </mesh>
      </group>

      {/* Cafe Dining Table 2 */}
      <group position={[1.3, 0, 1.1]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.035, 24]} />
          <meshStandardMaterial color="#6B4F3A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.72, 8]} />
          <meshStandardMaterial color="#1F2937" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.035, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// CORRIDOR ACCENTS: PLANTERS & EXTINGUISHERS
// ==========================================
export const CorridorPottedPlant: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  return (
    <group position={position}>
      {/* Matte Dark Planter */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.64, 16]} />
        <meshStandardMaterial color="#1F2937" roughness={0.4} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
        <meshStandardMaterial color="#2E1810" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#16A34A" roughness={0.7} />
      </mesh>
      <mesh position={[0.08, 1.25, -0.04]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#22C55E" roughness={0.7} />
      </mesh>
    </group>
  );
};

export const WallFireExtinguisher: React.FC<{
  position: [number, number, number];
  rotation?: number;
}> = ({ position, rotation = 0 }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.32, 0.55, 0.18]} />
        <meshStandardMaterial color="#DC2626" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.25, 0.095]}>
        <planeGeometry args={[0.22, 0.42]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.8} />
      </mesh>
    </group>
  );
};

// ==========================================
// REAL EXIT STAIRS WITH HANDRAILS & SIGN
// ==========================================
export const ExitStairs: React.FC<{
  position: [number, number, number];
  rotation?: number;
  signText?: string;
}> = ({ position, rotation = 0, signText = 'EXIT' }) => {
  const steps = 6;
  const stepWidth = 2.4;
  const stepTread = 0.35;
  const stepRiser = 0.18;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Architectural Green EXIT Sign over the door */}
      <group position={[0, 2.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.26, 0.06]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[0.7, 0.22]} />
          <meshStandardMaterial
            color="#16A34A"
            emissive="#16A34A"
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>
        <pointLight color="#16A34A" intensity={2.0} distance={5} />
      </group>

      {/* Concrete Steps */}
      {Array.from({ length: steps }).map((_, i) => {
        const y = -i * stepRiser;
        const z = i * stepTread;
        return (
          <mesh key={i} position={[0, y - stepRiser / 2, z + stepTread / 2]} castShadow receiveShadow>
            <boxGeometry args={[stepWidth, stepRiser, stepTread]} />
            <meshStandardMaterial color="#64748B" roughness={0.5} />
          </mesh>
        );
      })}

      {/* Lower Landing */}
      <mesh
        position={[0, -steps * stepRiser - 0.05, steps * stepTread + 0.8]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[stepWidth, 0.1, 1.6]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Stainless Steel Handrails */}
      {[-stepWidth / 2 + 0.08, stepWidth / 2 - 0.08].map((xOffset, sideIdx) => (
        <group key={sideIdx} position={[xOffset, 0, 0]}>
          <mesh
            position={[0, -0.3, (steps * stepTread) / 2]}
            rotation={[Math.atan2(steps * stepRiser, steps * stepTread), 0, 0]}
          >
            <cylinderGeometry args={[0.025, 0.025, Math.sqrt(Math.pow(steps * stepRiser, 2) + Math.pow(steps * stepTread, 2)) + 0.6, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.45, 0.1]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, -steps * stepRiser + 0.45, steps * stepTread]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
