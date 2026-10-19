import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { HazardType } from '../../types';
import { createNewHazard } from '../../engine/hazards/hazardEngine';
import {
  Flame,
  Droplets,
  Ban,
  Plus,
  Trash2,
  Power,
  ShieldCheck,
} from 'lucide-react';

export const HazardSimulatorPanel: React.FC = () => {
  const {
    building,
    hazards,
    addHazard,
    removeHazard,
    toggleHazard,
    updateHazardIntensity,
    toggleEdgeBlocked,
  } = useAppStore();

  const [selectedType, setSelectedType] = useState<HazardType>('fire');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(building.nodes[0]?.id || '');
  const [intensity, setIntensity] = useState<number>(75);
  const [radius, setRadius] = useState<number>(5.0);
  const [spreadSpeed, setSpreadSpeed] = useState<number>(1.2);

  const handleCreateHazard = () => {
    const node = building.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;

    const newH = createNewHazard(
      selectedType,
      [node.x, node.y, node.z],
      intensity,
      radius,
      spreadSpeed,
      node.roomId
    );
    addHazard(newH);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto overflow-y-auto h-full text-[#172033] select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            Hazard & Barrier Simulation
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Inject thermal, hydraulic, and structural barriers to trigger autonomous rerouting
          </p>
        </div>
      </div>

      {/* 1. Hazard Injection Form */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-4">
          <Plus className="w-4 h-4 text-blue-600" />
          Inject New Incident Hazard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Hazard Type */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] mb-2 block">
              Incident Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('fire')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition-colors ${
                  selectedType === 'fire'
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-xs'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                <Flame className="w-4 h-4 text-red-500" />
                Fire
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('flood')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition-colors ${
                  selectedType === 'flood'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                <Droplets className="w-4 h-4 text-blue-500" />
                Flood
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('blocked')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border transition-colors ${
                  selectedType === 'blocked'
                    ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-xs'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                <Ban className="w-4 h-4 text-orange-500" />
                Blocked
              </button>
            </div>
          </div>

          {/* Location Target */}
          <div>
            <label className="text-[11px] font-semibold text-[#64748B] mb-2 block">
              Target Location Node
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500 transition-colors"
            >
              {building.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Intensity */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#64748B] mb-2">
              <span>Severity Intensity</span>
              <span className="font-mono text-blue-600 font-bold">{intensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0]">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#64748B] mb-1.5">
              <span>Effect Radius (Meters)</span>
              <span className="font-mono text-blue-600 font-bold">{radius}m</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="12.0"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#64748B] mb-1.5">
              <span>Spread Propagation Velocity</span>
              <span className="font-mono text-blue-600 font-bold">{spreadSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.2"
              value={spreadSpeed}
              onChange={(e) => setSpreadSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleCreateHazard}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Deploy Hazard
          </button>
        </div>
      </div>

      {/* 2. Active Hazards List */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-3.5">
          <Flame className="w-4 h-4 text-red-500" />
          Active Incident Scenarios ({hazards.length})
        </h3>

        {hazards.length > 0 ? (
          <div className="space-y-3">
            {hazards.map((h) => {
              const node = building.nodes.find((n) => n.id === h.nodeId);
              return (
                <div
                  key={h.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    h.active
                      ? 'bg-red-50/50 border-red-200 shadow-xs'
                      : 'bg-slate-50 border-[#E2E8F0] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHazard(h.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        h.active
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-200 text-[#64748B] hover:text-[#172033]'
                      }`}
                      title={h.active ? 'Disable hazard' : 'Enable hazard'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="text-xs font-bold text-[#172033] flex items-center gap-2 capitalize">
                        {h.type} Hazard
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#64748B] border border-[#E2E8F0]">
                          {node?.name || `Node ${h.nodeId}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        Radius: {h.radius}m • Spread Rate: {h.spreadSpeed}x
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Live Intensity Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#64748B]">Intensity:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={h.intensity}
                        onChange={(e) => updateHazardIntensity(h.id, parseInt(e.target.value))}
                        className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                      <span className="text-xs font-mono font-bold text-[#172033] w-8">
                        {h.intensity}%
                      </span>
                    </div>

                    <button
                      onClick={() => removeHazard(h.id)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Extinguish and delete hazard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-[#64748B] text-xs flex flex-col items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Facility is hazard-free. Add hazards above to test evacuation rerouting.</span>
          </div>
        )}
      </div>

      {/* 3. Physical Corridor Blocking Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-2">
          <Ban className="w-4 h-4 text-orange-500" />
          Direct Corridor Passage Interdiction
        </h3>
        <p className="text-xs text-[#64748B] mb-4">
          Manually seal or unseal individual building corridors and emergency doors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {building.edges.map((edge) => {
            const from = building.nodes.find((n) => n.id === edge.fromNodeId);
            const to = building.nodes.find((n) => n.id === edge.toNodeId);
            if (!from || !to) return null;

            return (
              <button
                key={edge.id}
                onClick={() => toggleEdgeBlocked(edge.id)}
                className={`p-2.5 rounded-lg text-left border transition-all flex items-center justify-between ${
                  edge.isBlocked
                    ? 'bg-red-50 border-red-400 text-red-900 shadow-xs'
                    : 'bg-white border-[#E2E8F0] hover:border-slate-300 text-[#172033]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold truncate">
                    {from.name} ↔ {to.name}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Dist: {edge.distance}m {edge.isDoor ? '• Door' : ''}
                  </div>
                </div>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${
                    edge.isBlocked
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-[#64748B]'
                  }`}
                >
                  {edge.isBlocked ? 'BLOCKED' : 'OPEN'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
