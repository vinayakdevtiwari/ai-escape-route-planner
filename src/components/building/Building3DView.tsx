import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Bounds, Grid, useBounds } from '@react-three/drei';
import { EffectComposer, SSAO, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { RoomMesh } from './RoomMesh';
import { NavigationGraph3D } from './NavigationGraph3D';
import { HazardMesh3D } from './HazardMesh3D';
import { RoutePath3D } from './RoutePath3D';
import { EvacueeMarker3D } from './EvacueeMarker3D';
import { CameraControls } from './CameraControls';
import {
  CorridorPottedPlant,
  WallFireExtinguisher,
} from './RoomFurniture3D';
import {
  Layers,
  Eye,
  Maximize2,
  Compass,
} from 'lucide-react';

const SimulationTicker: React.FC = () => {
  const tickSimulation = useAppStore((s) => s.tickSimulation);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    tickSimulation(clampedDelta);
  });

  return null;
};

const AutoFitBounds: React.FC = () => {
  const bounds = useBounds();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      bounds.refresh().clip().fit();
    }, 150);
    return () => clearTimeout(timer);
  }, [bounds]);

  return null;
};

export const Building3DView: React.FC = () => {
  const {
    building,
    selectedRoomId,
    selectedNodeId,
    startNodeId,
    currentRoute,
    hazards,
    evacuationSim,
    settings,
    selectRoom,
    setHoveredRoom,
    selectNode,
    toggleEdgeBlocked,
    updateSettings,
  } = useAppStore();

  return (
    <div className="relative w-full h-full bg-[#0A0F1C] overflow-hidden select-none">
      {/* 3D Canvas with Dark Cinematic Theme and Accurate Lighting */}
      <Canvas
        shadows
        camera={{ position: [10.2, 12.2, 10.2], fov: 38 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* 2. BACKGROUND & FOG (#0a0f1c, fog near 60, far 160) */}
        <color attach="background" args={['#0A0F1C']} />
        <fog attach="fog" args={['#0A0F1C', 60, 160]} />

        {/* 5. LIGHTING: Reduced ambient to 0.25, Warm Main Directional Light #fff1dc */}
        <ambientLight intensity={0.25} color="#FFFFFF" />

        <directionalLight
          position={[20, 34, 18]}
          intensity={1.6}
          color="#FFF1DC"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={85}
          shadow-camera-left={-28}
          shadow-camera-right={28}
          shadow-camera-top={28}
          shadow-camera-bottom={-28}
          shadow-bias={-0.0005}
        />

        {/* Soft Secondary Fill Light */}
        <directionalLight
          position={[-18, 14, -16]}
          intensity={0.3}
          color="#38BDF8"
        />

        {/* PBR Environment for subtle architectural reflections */}
        <Environment preset="warehouse" environmentIntensity={0.5} />

        {/* 2. GROUND: Large dark reflective plane (#0d1424, roughness 0.4, metalness 0.6) */}
        <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[250, 250]} />
          <meshStandardMaterial
            color="#0D1424"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Faint grid fading out with distance */}
        {settings.showGrid && (
          <Grid
            position={[0, -0.21, 0]}
            args={[140, 140]}
            cellSize={1.5}
            cellThickness={0.5}
            cellColor="#1E293B"
            sectionSize={6}
            sectionThickness={0.8}
            sectionColor="#2D3748"
            fadeDistance={65}
            fadeStrength={1.5}
          />
        )}

        {/* 1. AUTO-FIT CAMERA WITH <Bounds fit clip observe margin={1.1}> (~75% fill) */}
        <Bounds fit clip observe margin={1.1}>
          <AutoFitBounds />
          <group>
            {/* Opaque Rooms with Floor Textures & Contact Trim */}
            {building.rooms.map((room) => (
              <RoomMesh
                key={room.id}
                room={room}
                isSelected={room.id === selectedRoomId}
                showLabels={settings.showRoomLabels}
                showWalls={settings.showWalls}
                cutawayView={settings.cutawayView}
                onSelect={selectRoom}
                onHover={setHoveredRoom}
              />
            ))}

            {/* Corridor Props */}
            {building.id === 'building-office' && (
              <group>
                <CorridorPottedPlant position={[-6, 0, 1.4]} />
                <CorridorPottedPlant position={[6, 0, 1.4]} />
                <CorridorPottedPlant position={[-11, 0, -1.4]} />
                <CorridorPottedPlant position={[11, 0, -1.4]} />
                <WallFireExtinguisher position={[-4, 0, -1.8]} rotation={0} />
                <WallFireExtinguisher position={[4, 0, -1.8]} rotation={0} />
              </group>
            )}

            {/* Navigation Graph */}
            {settings.showNavGraph && (
              <NavigationGraph3D
                nodes={building.nodes}
                edges={building.edges}
                startNodeId={startNodeId}
                selectedNodeId={selectedNodeId}
                onSelectNode={selectNode}
                onToggleEdgeBlocked={toggleEdgeBlocked}
              />
            )}

            {/* Active Hazards */}
            {settings.showHazards && <HazardMesh3D hazards={hazards} />}

            {/* Glowing Cyan Evacuation Route Ribbon */}
            <RoutePath3D route={currentRoute} visible={settings.showRouteLine} />

            {/* Low-Poly Human Evacuee (Orange body) */}
            <EvacueeMarker3D simState={evacuationSim} />
          </group>
        </Bounds>

        {/* 5. POST-PROCESSING: SSAO, Bloom, Vignette */}
        <EffectComposer multisampling={4}>
          <SSAO radius={0.4} intensity={20} />
          <Bloom intensity={0.4} luminanceThreshold={0.9} mipmapBlur />
          <Vignette offset={0.2} darkness={0.4} />
        </EffectComposer>

        {/* Camera Controls with ~50° Polar Angle and Limits */}
        <CameraControls mode={settings.cameraMode} />

        {/* Real-time simulation ticker */}
        <SimulationTicker />
      </Canvas>

      {/* Floating View Controls Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        {/* Camera Mode Switcher */}
        <div className="flex items-center bg-[#0F172A]/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 shadow-lg">
          <button
            onClick={() => updateSettings({ cameraMode: 'isometric' })}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              settings.cameraMode === 'isometric'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Elevated Isometric Perspective (Default)"
          >
            <Layers className="w-3.5 h-3.5" />
            Isometric
          </button>
          <button
            onClick={() => updateSettings({ cameraMode: 'perspective' })}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              settings.cameraMode === 'perspective'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Free 3D Orbit Camera"
          >
            <Compass className="w-3.5 h-3.5" />
            Orbit
          </button>
          <button
            onClick={() => updateSettings({ cameraMode: 'top-down' })}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
              settings.cameraMode === 'top-down'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Top-Down Plan View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Top-Down
          </button>
        </div>

        {/* Cutaway & Walls Toggles */}
        <div className="flex items-center bg-[#0F172A]/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 shadow-lg">
          <button
            onClick={() => updateSettings({ cutawayView: !settings.cutawayView })}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors ${
              settings.cutawayView
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Cutaway View (Lowers front walls for interior visibility)"
          >
            Cutaway View
          </button>
          <button
            onClick={() => updateSettings({ showWalls: !settings.showWalls })}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors ${
              settings.showWalls
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
            title="Toggle Structural Walls Visibility"
          >
            Walls
          </button>
        </div>

        {/* Viewport Visualization Toggles */}
        <div className="flex items-center bg-[#0F172A]/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 shadow-lg">
          <button
            onClick={() => updateSettings({ showNavGraph: !settings.showNavGraph })}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              settings.showNavGraph
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Navigation Graph Corridors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Architectural Bottom Color Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 bg-[#0F172A]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-lg text-[11px] text-slate-300">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Safe Exit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Route & Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Fire Hazard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Flood Area</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>Blocked Passage</span>
        </div>
      </div>
    </div>
  );
};
