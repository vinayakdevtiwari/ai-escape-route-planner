import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ShieldCheck,
  Clock,
  Compass,
  AlertTriangle,
  Flame,
  Info,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { RouteIntelligenceModal } from '../routes/RouteIntelligenceModal';

export const RightInfoPanel: React.FC = () => {
  const {
    building,
    selectedRoomId,
    currentRoute,
    hazards,
    evacuationSim,
    selectRoom,
    setActiveTab,
  } = useAppStore();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const selectedRoom = building.rooms.find((r) => r.id === selectedRoomId);
  const activeHazards = hazards.filter((h) => h.active);

  // Safety Score meter styling
  const safety = currentRoute?.safetyScore ?? 100;
  const safetyColor =
    safety >= 75 ? 'text-emerald-600' : safety >= 45 ? 'text-amber-600' : 'text-red-600';
  const safetyBg =
    safety >= 75 ? 'bg-emerald-600' : safety >= 45 ? 'bg-amber-500' : 'bg-red-600';

  return (
    <aside className="w-84 bg-[#F8FAFC] border-l border-[#E2E8F0] p-4 flex flex-col gap-3.5 overflow-y-auto select-none z-20">
      {/* 1. Route Telemetry Card */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            Route Telemetry
          </span>
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {currentRoute?.strategyUsed || 'balanced'}
          </span>
        </div>

        {/* Safety Score Meter */}
        <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-600 font-medium">Safety Score</span>
            <span className={`text-lg font-bold font-mono ${safetyColor}`}>
              {safety}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${safetyBg}`}
              style={{ width: `${safety}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>High Risk</span>
            <span>Optimal Safety</span>
          </div>
        </div>

        {/* Distance & Estimated Time */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#E2E8F0]">
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-0.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Distance</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-mono">
              {currentRoute?.totalDistance ?? 0} <span className="text-xs font-normal text-slate-500">m</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#E2E8F0]">
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Est. Time</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-mono">
              ~{currentRoute?.estimatedTimeSeconds ?? 0} <span className="text-xs font-normal text-slate-500">s</span>
            </div>
          </div>
        </div>

        {/* In-Transit Evacuation Progress */}
        {evacuationSim.status === 'running' && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span className="text-blue-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
                Evacuation Progress
              </span>
              <span className="font-mono text-slate-800">
                {evacuationSim.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-200"
                style={{ width: `${evacuationSim.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>{evacuationSim.distanceTraveled}m traveled</span>
              <span>{evacuationSim.distanceRemaining}m left</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Route Intelligence Card */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Route Intelligence</span>
          </div>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            Rationale
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
          {currentRoute?.explanation || 'Optimal route calculated.'}
        </p>

        {currentRoute?.recalculatedDueTo && (
          <div className="mt-2.5 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Dynamic Divergence:</span>{' '}
              {currentRoute.recalculatedDueTo}
            </div>
          </div>
        )}
      </div>

      {/* 3. Room Inspector Card */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            Room Inspector
          </span>
          {selectedRoom && (
            <button
              onClick={() => selectRoom(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {selectedRoom ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900">{selectedRoom.name}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {selectedRoom.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div>Dimensions: <span className="text-slate-800 font-semibold">{selectedRoom.width}×{selectedRoom.depth}m</span></div>
              <div>Capacity: <span className="text-slate-800 font-semibold">{selectedRoom.capacity ?? 'N/A'} pers.</span></div>
              <div>Floor Level: <span className="text-slate-800 font-semibold">{selectedRoom.floor}</span></div>
              <div>Ceiling Height: <span className="text-slate-800 font-semibold">{selectedRoom.height}m</span></div>
            </div>

            {selectedRoom.description && (
              <p className="text-[11px] text-slate-600 italic pt-1.5 border-t border-slate-100">
                "{selectedRoom.description}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-3 text-center italic">
            Click any room in the 3D model to inspect architectural specifications.
          </div>
        )}
      </div>

      {/* 4. Hazard Status Card */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-600" />
            Hazard Status
          </span>
          <button
            onClick={() => setActiveTab('hazards')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage
          </button>
        </div>

        {activeHazards.length > 0 ? (
          <div className="space-y-2">
            {activeHazards.map((h) => (
              <div
                key={h.id}
                className="bg-red-50/70 border border-red-200 p-2.5 rounded-lg text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <div>
                    <div className="font-bold text-red-900 capitalize">
                      {h.type} Hazard
                    </div>
                    <div className="text-[11px] text-red-700">
                      Intensity: {h.intensity}% • Radius: {h.radius}m
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-3 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero active hazards. Building is secure.</span>
          </div>
        )}
      </div>

      {/* Route Intelligence Modal */}
      <RouteIntelligenceModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </aside>
  );
};
