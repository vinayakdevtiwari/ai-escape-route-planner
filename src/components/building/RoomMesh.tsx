import React, { useState } from 'react';
import { Room } from '../../types';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  getCheckerTileTexture,
  getCarpetTexture,
  getConcreteTexture,
  getDatacenterTileTexture,
  getDarkWoodTexture,
} from '../../utils/proceduralTextures';
import {
  OfficeWorkstation,
  ExecutiveLoungeSet,
  ServerRackUnit,
  ConferenceFurniture,
  CafeteriaFurniture,
  ExitStairs,
} from './RoomFurniture3D';

interface RoomMeshProps {
  room: Room;
  isSelected: boolean;
  showLabels: boolean;
  showWalls: boolean;
  cutawayView: boolean;
  onSelect: (roomId: string) => void;
  onHover: (roomId: string | null) => void;
}

export const RoomMesh: React.FC<RoomMeshProps> = ({
  room,
  isSelected,
  showWalls,
  cutawayView,
  onSelect,
  onHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isExit = room.type === 'exit';
  const isCorridor = room.type === 'corridor';
  const isLobby = room.type === 'lobby' || room.id === 'room-lobby';
  const isDatacenter = room.id === 'room-server' || room.type === 'laboratory';
  const isCafeteria = room.id === 'room-breakroom';
  const isConference = room.id === 'room-conference' || room.type === 'conference';

  const W = room.width;
  const D = room.depth;
  const H = room.height || 3.2;
  const T = 0.2; // Wall thickness 0.2m
  const baseboardH = 0.12; // 0.12 m subtle darker baseboard
  const ceilingTrimH = 0.08;

  // Wall heights based on cutaway mode
  const fullWallHeight = showWalls ? H : 0.2;
  const cutawayFrontWallHeight = cutawayView ? 1.05 : fullWallHeight;
  const showCeiling = showWalls && !cutawayView && !isExit;

  // 3. REALISTIC FLOOR MATERIALS (NO flat saturated colors!)
  let floorTexture: THREE.CanvasTexture;
  let floorRoughness = 0.85;
  let floorMetalness = 0.05;

  if (isCafeteria) {
    floorTexture = getCheckerTileTexture();
    floorRoughness = 0.4;
  } else if (isDatacenter) {
    floorTexture = getDatacenterTileTexture();
    floorRoughness = 0.5;
    floorMetalness = 0.25;
  } else if (isConference) {
    floorTexture = getDarkWoodTexture();
    floorRoughness = 0.5;
  } else if (isCorridor || isLobby || isExit) {
    // Corridor and lobby: polished concrete, color #8a8f98, roughness 0.3
    floorTexture = getConcreteTexture();
    floorRoughness = 0.3;
  } else {
    // Offices: grey carpet, color #4a4f5a, roughness 0.95
    floorTexture = getCarpetTexture('#4A4F5A');
    floorRoughness = 0.95;
  }

  // 4. WALL MATERIALS (Off-white #e8e6e1 matte)
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#E8E6E1',
    roughness: 0.92,
    metalness: 0.02,
    transparent: false,
    opacity: 1.0,
  });

  const selectedWallMaterial = new THREE.MeshStandardMaterial({
    color: '#E0E7FF',
    roughness: 0.85,
    metalness: 0.05,
    emissive: '#2563EB',
    emissiveIntensity: 0.15,
  });

  const activeWallMat = isSelected ? selectedWallMaterial : wallMaterial;

  // Subtle darker baseboard material (0.12m)
  const baseboardMat = new THREE.MeshStandardMaterial({
    color: '#2C313D',
    roughness: 0.7,
    metalness: 0.1,
  });

  // Ceiling trim material (0.08m)
  const ceilingTrimMat = new THREE.MeshStandardMaterial({
    color: '#384152',
    roughness: 0.7,
  });

  // Door angle: make some doors open at 70 degrees (1.22 rad) for architectural realism
  const isDoorWideOpen = room.id.charCodeAt(room.id.length - 1) % 2 === 0;
  const doorOpenAngle = isDoorWideOpen ? 1.22 : 0.55; // 1.22 rad = 70 degrees

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    onHover(room.id);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    onHover(null);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(room.id);
  };

  const doorWidth = 1.3;
  const doorHeight = 2.2;
  const windowWidth = 2.4;
  const windowHeight = 1.4;
  const windowSillHeight = 0.9;

  // Identity color for thin perimeter baseboard strip
  const identityColor = isExit
    ? '#16A34A'
    : room.id === 'room-server'
    ? '#06B6D4'
    : room.id === 'room-conference'
    ? '#0D9488'
    : room.id === 'room-office-103'
    ? '#8B5CF6'
    : room.id === 'room-breakroom'
    ? '#EA580C'
    : room.color || '#3B82F6';

  return (
    <group position={[room.x, room.y, room.z]}>
      {/* Interaction Hit Volume covering the entire room for responsive hovering and selection */}
      <mesh
        position={[0, H / 2, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[W, H, D]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 1. SOLID FLOOR SLAB (0.3m thick, opaque with realistic material - NO flat saturated color block) */}
      <mesh
        position={[0, -0.15, 0]}
        receiveShadow
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[W, 0.3, D]} />
        <meshStandardMaterial
          map={floorTexture}
          color="#FFFFFF"
          roughness={floorRoughness}
          metalness={floorMetalness}
          transparent={false}
          opacity={1.0}
        />
      </mesh>

      {/* Thin colored floor-edge perimeter strip (0.05m wide) to keep room identity without coloring the floor */}
      {!isCorridor && (
        <group position={[0, 0.01, 0]}>
          {/* North edge */}
          <mesh position={[0, 0, -D / 2 + 0.025]}>
            <boxGeometry args={[W, 0.02, 0.05]} />
            <meshStandardMaterial
              color={identityColor}
              emissive={identityColor}
              emissiveIntensity={isSelected ? 1.6 : 0.4}
            />
          </mesh>
          {/* South edge */}
          <mesh position={[0, 0, D / 2 - 0.025]}>
            <boxGeometry args={[W, 0.02, 0.05]} />
            <meshStandardMaterial
              color={identityColor}
              emissive={identityColor}
              emissiveIntensity={isSelected ? 1.6 : 0.4}
            />
          </mesh>
          {/* West edge */}
          <mesh position={[-W / 2 + 0.025, 0, 0]}>
            <boxGeometry args={[0.05, 0.02, D]} />
            <meshStandardMaterial
              color={identityColor}
              emissive={identityColor}
              emissiveIntensity={isSelected ? 1.6 : 0.4}
            />
          </mesh>
          {/* East edge */}
          <mesh position={[W / 2 - 0.025, 0, 0]}>
            <boxGeometry args={[0.05, 0.02, D]} />
            <meshStandardMaterial
              color={identityColor}
              emissive={identityColor}
              emissiveIntensity={isSelected ? 1.6 : 0.4}
            />
          </mesh>
        </group>
      )}

      {/* Selected room boundary outline */}
      {isSelected && (
        <lineSegments position={[0, 0.03, 0]}>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(W + 0.05, 0.04, D + 0.05)]} />
          <lineBasicMaterial attach="material" color="#22D3EE" linewidth={3} />
        </lineSegments>
      )}

      {/* 2. SOLID CEILING SLAB (0.2m thick, opaque) */}
      {showCeiling && (
        <group position={[0, H + 0.1, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[W, 0.2, D]} />
            <meshStandardMaterial
              color="#E8E6E1"
              roughness={0.9}
              transparent={false}
              opacity={1.0}
            />
          </mesh>
        </group>
      )}

      {/* 3. LIGHTING: Warm pointLight (intensity 8, distance 10) with emissive ceiling panel in each room */}
      {!isCorridor && !isExit && (
        <group position={[0, H - 0.03, 0]}>
          {/* Emissive ceiling panel */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[Math.min(W * 0.45, 2.5), 0.04, Math.min(D * 0.35, 1.3)]} />
            <meshStandardMaterial
              color="#FFF6E8"
              emissive="#FFF1DC"
              emissiveIntensity={2.5}
              roughness={0.2}
            />
          </mesh>
          {/* Warm point light: intensity 8, distance 10, shadows off */}
          <pointLight
            color="#FFF1DC"
            intensity={8}
            distance={10}
            decay={2}
            castShadow={false}
            position={[0, -0.3, 0]}
          />
        </group>
      )}

      {/* 4. SOLID WALLS WITH CONTACT BASEBOARD & TRIM */}
      {!isCorridor && fullWallHeight > 0.3 && (
        <group>
          {/* ================= NORTH WALL (z = -D/2) with Real Window Cutout ================= */}
          <group position={[0, 0, -D / 2 + T / 2]}>
            {/* Left of window */}
            <mesh
              position={[-(W / 2 + windowWidth / 2) / 2, fullWallHeight / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[(W - windowWidth) / 2, fullWallHeight, T]} />
              <primitive object={activeWallMat} />
            </mesh>

            {/* Right of window */}
            <mesh
              position={[(W / 2 + windowWidth / 2) / 2, fullWallHeight / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[(W - windowWidth) / 2, fullWallHeight, T]} />
              <primitive object={activeWallMat} />
            </mesh>

            {/* Window Sill */}
            <mesh position={[0, windowSillHeight / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[windowWidth, windowSillHeight, T]} />
              <primitive object={activeWallMat} />
            </mesh>

            {/* Window Lintel */}
            {fullWallHeight > windowSillHeight + windowHeight && (
              <mesh
                position={[
                  0,
                  (windowSillHeight + windowHeight + fullWallHeight) / 2,
                  0,
                ]}
                castShadow
                receiveShadow
              >
                <boxGeometry
                  args={[
                    windowWidth,
                    fullWallHeight - (windowSillHeight + windowHeight),
                    T,
                  ]}
                />
                <primitive object={activeWallMat} />
              </mesh>
            )}

            {/* Darker Baseboard (0.12m) */}
            <mesh position={[0, baseboardH / 2, T / 2 + 0.01]} castShadow>
              <boxGeometry args={[W, baseboardH, 0.02]} />
              <primitive object={baseboardMat} />
            </mesh>

            {/* Ceiling Trim (0.08m) */}
            {fullWallHeight > 2.5 && (
              <mesh position={[0, fullWallHeight - ceilingTrimH / 2, T / 2 + 0.01]}>
                <boxGeometry args={[W, ceilingTrimH, 0.02]} />
                <primitive object={ceilingTrimMat} />
              </mesh>
            )}

            {/* Glass Pane */}
            <mesh position={[0, windowSillHeight + windowHeight / 2, 0]}>
              <boxGeometry args={[windowWidth - 0.04, windowHeight - 0.04, 0.03]} />
              <meshPhysicalMaterial
                color="#F0F9FF"
                transmission={0.9}
                opacity={0.3}
                transparent={true}
                roughness={0.1}
                ior={1.5}
                thickness={0.08}
              />
            </mesh>

            {/* Window Frame */}
            <mesh position={[0, windowSillHeight + windowHeight / 2, 0]}>
              <boxGeometry args={[windowWidth, windowHeight, 0.06]} />
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(windowWidth, windowHeight, 0.06)]} />
                <lineBasicMaterial attach="material" color="#1E293B" linewidth={1.5} />
              </lineSegments>
            </mesh>
          </group>

          {/* ================= SOUTH WALL (z = D/2) with Real Doorway ================= */}
          <group position={[0, 0, D / 2 - T / 2]}>
            {/* Left of door */}
            <mesh
              position={[-(W / 2 + doorWidth / 2) / 2, cutawayFrontWallHeight / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[(W - doorWidth) / 2, cutawayFrontWallHeight, T]} />
              <primitive object={activeWallMat} />
            </mesh>

            {/* Right of door */}
            <mesh
              position={[(W / 2 + doorWidth / 2) / 2, cutawayFrontWallHeight / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[(W - doorWidth) / 2, cutawayFrontWallHeight, T]} />
              <primitive object={activeWallMat} />
            </mesh>

            {/* Baseboards left and right of doorway */}
            <mesh position={[-(W / 2 + doorWidth / 2) / 2, baseboardH / 2, -T / 2 - 0.01]} castShadow>
              <boxGeometry args={[(W - doorWidth) / 2, baseboardH, 0.02]} />
              <primitive object={baseboardMat} />
            </mesh>
            <mesh position={[(W / 2 + doorWidth / 2) / 2, baseboardH / 2, -T / 2 - 0.01]} castShadow>
              <boxGeometry args={[(W - doorWidth) / 2, baseboardH, 0.02]} />
              <primitive object={baseboardMat} />
            </mesh>

            {/* Door Header */}
            {!cutawayView && fullWallHeight > doorHeight && (
              <mesh
                position={[0, (doorHeight + fullWallHeight) / 2, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[doorWidth, fullWallHeight - doorHeight, T]} />
                <primitive object={activeWallMat} />
              </mesh>
            )}

            {/* Door Frame (Visible dark metal PBR frame) */}
            <group position={[0, doorHeight / 2, 0]}>
              <mesh position={[-doorWidth / 2 + 0.03, 0, 0]} castShadow>
                <boxGeometry args={[0.06, doorHeight, T + 0.04]} />
                <meshStandardMaterial color="#1E2530" metalness={0.7} roughness={0.35} />
              </mesh>
              <mesh position={[doorWidth / 2 - 0.03, 0, 0]} castShadow>
                <boxGeometry args={[0.06, doorHeight, T + 0.04]} />
                <meshStandardMaterial color="#1E2530" metalness={0.7} roughness={0.35} />
              </mesh>
              <mesh position={[0, doorHeight / 2 - 0.03, 0]} castShadow>
                <boxGeometry args={[doorWidth, 0.06, T + 0.04]} />
                <meshStandardMaterial color="#1E2530" metalness={0.7} roughness={0.35} />
              </mesh>
            </group>

            {/* Door Leaf (Wood PBR material with visible handle, open at 70° or 30°) */}
            <group position={[-doorWidth / 2 + 0.04, 0, 0]} rotation={[0, doorOpenAngle, 0]}>
              <mesh position={[doorWidth / 2 - 0.04, doorHeight / 2, 0]} castShadow>
                <boxGeometry args={[doorWidth - 0.08, doorHeight - 0.06, 0.045]} />
                <meshStandardMaterial
                  color="#5A3D28"
                  roughness={0.45}
                  metalness={0.1}
                />
              </mesh>
              {/* Door Lever Handle (Polished silver/chrome) */}
              <group position={[doorWidth - 0.18, 1.0, 0.035]}>
                <mesh castShadow>
                  <boxGeometry args={[0.11, 0.024, 0.05]} />
                  <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
                </mesh>
                <mesh position={[-0.04, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
                  <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
                </mesh>
              </group>
            </group>
          </group>

          {/* ================= WEST WALL (x = -W/2) Solid Opaque ================= */}
          <group position={[-W / 2 + T / 2, 0, 0]}>
            <mesh position={[0, fullWallHeight / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[T, fullWallHeight, D]} />
              <primitive object={activeWallMat} />
            </mesh>
            {/* Baseboard */}
            <mesh position={[T / 2 + 0.01, baseboardH / 2, 0]} castShadow>
              <boxGeometry args={[0.02, baseboardH, D]} />
              <primitive object={baseboardMat} />
            </mesh>
            {/* Ceiling trim */}
            {fullWallHeight > 2.5 && (
              <mesh position={[T / 2 + 0.01, fullWallHeight - ceilingTrimH / 2, 0]}>
                <boxGeometry args={[0.02, ceilingTrimH, D]} />
                <primitive object={ceilingTrimMat} />
              </mesh>
            )}
          </group>

          {/* ================= EAST WALL (x = W/2) Solid Opaque ================= */}
          <group position={[W / 2 - T / 2, 0, 0]}>
            <mesh position={[0, fullWallHeight / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[T, fullWallHeight, D]} />
              <primitive object={activeWallMat} />
            </mesh>
            {/* Baseboard */}
            <mesh position={[-T / 2 - 0.01, baseboardH / 2, 0]} castShadow>
              <boxGeometry args={[0.02, baseboardH, D]} />
              <primitive object={baseboardMat} />
            </mesh>
            {/* Ceiling trim */}
            {fullWallHeight > 2.5 && (
              <mesh position={[-T / 2 - 0.01, fullWallHeight - ceilingTrimH / 2, 0]}>
                <boxGeometry args={[0.02, ceilingTrimH, D]} />
                <primitive object={ceilingTrimMat} />
              </mesh>
            )}
          </group>
        </group>
      )}

      {/* 5. FURNITURE PROPS */}
      {room.id === 'room-office-101' && (
        <group>
          <OfficeWorkstation position={[-1.4, 0, -0.6]} rotation={0} />
          <OfficeWorkstation position={[1.4, 0, -0.6]} rotation={0} />
        </group>
      )}

      {room.id === 'room-office-102' && (
        <group>
          <OfficeWorkstation position={[-1.2, 0, -0.5]} rotation={0.15} />
          <OfficeWorkstation position={[1.2, 0, -0.5]} rotation={-0.15} />
        </group>
      )}

      {room.id === 'room-office-103' && (
        <group>
          <OfficeWorkstation position={[0, 0, -1.2]} isExecutive rotation={0} />
          <ExecutiveLoungeSet position={[0, 0, 1.2]} />
        </group>
      )}

      {isDatacenter && (
        <group>
          <ServerRackUnit position={[-1.5, 0, -0.9]} />
          <ServerRackUnit position={[-0.5, 0, -0.9]} />
          <ServerRackUnit position={[0.5, 0, -0.9]} />
          <ServerRackUnit position={[1.5, 0, -0.9]} />
          <ServerRackUnit position={[-1.5, 0, 1.0]} />
          <ServerRackUnit position={[-0.5, 0, 1.0]} />
          <ServerRackUnit position={[0.5, 0, 1.0]} />
          <ServerRackUnit position={[1.5, 0, 1.0]} />
        </group>
      )}

      {isConference && (
        <ConferenceFurniture position={[0, 0, 0]} roomWidth={W} roomDepth={D} />
      )}

      {isCafeteria && <CafeteriaFurniture position={[0, 0, 0]} />}

      {isExit && (
        <ExitStairs
          position={[0, 0, 0]}
          rotation={room.x < 0 ? -Math.PI / 2 : Math.PI / 2}
          signText={room.name.includes('A') ? 'EXIT A' : 'EXIT B'}
        />
      )}

      {/* 6. LABELS: Show only on hover or selection, fontSize 12px, dark pill with white text, distanceFactor 12 */}
      {(isHovered || isSelected) && (
        <Html
          position={[0, cutawayView ? 1.7 : H + 0.6, 0]}
          center
          distanceFactor={12}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-tight whitespace-nowrap shadow-2xl transition-all duration-150 flex items-center gap-2 backdrop-blur-md ${
              isExit
                ? 'bg-[#0A0F1C]/95 text-emerald-300 border border-emerald-500/80 font-bold'
                : isSelected
                ? 'bg-[#0A0F1C]/95 text-cyan-300 border-2 border-cyan-400 font-bold shadow-cyan-500/30'
                : 'bg-[#0A0F1C]/95 text-white border border-slate-700/80'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isExit ? 'bg-emerald-400' : isSelected ? 'bg-cyan-400' : identityColor
              }`}
            />
            <span>{isExit ? `Exit Portal: ${room.name}` : room.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
