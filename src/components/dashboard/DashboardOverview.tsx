import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { sampleScenarios } from '../../data/sampleScenarios';
import {
  ShieldAlert,
  DoorOpen,
  Flame,
  Activity,
  Sparkles,
  ArrowRight,
  Compass,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    building,
    hazards,
    currentRoute,
    setActiveTab,
    loadScenario,
  } = useAppStore();

  const activeHazardsCount = hazards.filter((h) => h.active).length;
  const blockedCorridorsCount = building.edges.filter((e) => e.isBlocked).length;
  const totalExits = building.nodes.filter((n) => n.isExit).length;

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto h-full text-[#172033] select-none">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-7 border border-[#E2E8F0] shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Autonomous Evacuation Operations
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
              AI Escape Route Planner <span className="text-blue-600">3D</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-1.5 max-w-xl leading-relaxed">
              Real-time multi-hazard simulation, adaptive A*/Dijkstra dynamic pathfinding, and autonomous route recalculation inside an interactive 3D architectural facility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('routes')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Compass className="w-4 h-4" />
              Plan Routes
            </button>
            <button
              onClick={() => setActiveTab('hazards')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#172033] border border-[#E2E8F0] flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Flame className="w-4 h-4 text-red-500" />
              Inject Hazard
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1.5">
            <span className="font-medium">Facility Rooms</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono">
            {building.rooms.length}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {building.nodes.length} navigation nodes
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1.5">
            <span className="font-medium">Emergency Exits</span>
            <DoorOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {totalExits}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            All doors operational
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1.5">
            <span className="font-medium">Active Hazards</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className={`text-2xl font-bold font-mono ${activeHazardsCount > 0 ? 'text-red-600' : 'text-[#172033]'}`}>
            {activeHazardsCount}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            {blockedCorridorsCount} corridor(s) impassable
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-1.5">
            <span className="font-medium">Route Safety Index</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 font-mono">
            {currentRoute?.safetyScore ?? 100}
            <span className="text-sm font-normal text-[#64748B]">/100</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            Exposure: {currentRoute?.hazardExposure ?? 0}%
          </div>
        </div>
      </div>

      {/* Preset Scenarios Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            Quick Scenario Testing Presets
          </h2>
          <span className="text-xs text-[#64748B]">Click any preset to simulate immediately</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleScenarios.map((sc) => {
            const hasFire = sc.initialHazards.some((h) => h.type === 'fire');
            const hasFlood = sc.initialHazards.some((h) => h.type === 'flood');
            const hasBlocked = sc.initialHazards.some((h) => h.type === 'blocked');

            return (
              <div
                key={sc.id}
                onClick={() => {
                  loadScenario(sc.id);
                  setActiveTab('building');
                }}
                className="group cursor-pointer bg-white hover:bg-slate-50/80 border border-[#E2E8F0] hover:border-blue-400 rounded-xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {sc.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {hasFire && <Flame className="w-3.5 h-3.5 text-red-500" />}
                      {hasFlood && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      {hasBlocked && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#172033] group-hover:text-blue-600 transition-colors">
                    {sc.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Launch Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
