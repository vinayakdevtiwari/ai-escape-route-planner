import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RouteStrategy } from '../../types';
import {
  Navigation,
  Compass,
  Shield,
  Scale,
  ArrowRight,
  MapPin,
  DoorOpen,
  Activity,
  Layers,
} from 'lucide-react';

export const RoutePlannerPanel: React.FC = () => {
  const {
    building,
    startNodeId,
    selectedExitNodeId,
    routeStrategy,
    currentRoute,
    settings,
    setStartNode,
    setSelectedExitNode,
    setRouteStrategy,
    recalculateRoute,
    updateSettings,
    setActiveTab,
  } = useAppStore();

  const exitNodes = building.nodes.filter((n) => n.isExit);
  const startCandidates = building.nodes.filter((n) => !n.isExit);

  const strategies: { id: RouteStrategy; name: string; desc: string; icon: any }[] = [
    {
      id: 'shortest',
      name: 'Shortest Route',
      desc: 'Minimizes total distance traveled. Directly targets closest accessible exit.',
      icon: Compass,
    },
    {
      id: 'safest',
      name: 'Safest Route',
      desc: 'Maximizes hazard clearance. Avoids compromised corridors and smoke zones.',
      icon: Shield,
    },
    {
      id: 'balanced',
      name: 'Balanced Route',
      desc: 'Optimal compromise between travel distance, time delay, and hazard exposure.',
      icon: Scale,
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto overflow-y-auto h-full text-[#172033] select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Adaptive Route Planner
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time A* and Dijkstra pathfinding with dynamic hazard awareness
          </p>
        </div>
        <button
          onClick={() => recalculateRoute('Manual re-evaluation triggered by user')}
          className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          Recalculate Route
        </button>
      </div>

      {/* Origin & Destination Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Starting Location */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-4 h-4 text-orange-500" />
            Evacuation Starting Point
          </label>
          <select
            value={startNodeId}
            onChange={(e) => setStartNode(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500 transition-colors"
          >
            {startCandidates.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} (Floor {n.floor})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#64748B] mt-2">
            Initial location of evacuees inside the facility.
          </p>
        </div>

        {/* Destination Exit */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-2.5">
            <DoorOpen className="w-4 h-4 text-emerald-600" />
            Target Emergency Exit
          </label>
          <select
            value={selectedExitNodeId || ''}
            onChange={(e) => setSelectedExitNode(e.target.value ? e.target.value : undefined)}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Auto-Detect Optimal Exit (Recommended)</option>
            {exitNodes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} {e.exitLabel ? `[${e.exitLabel}]` : ''}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#64748B] mt-2">
            Auto-detection evaluates all accessible exits based on your active strategy.
          </p>
        </div>
      </div>

      {/* Route Strategy Selection */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-3.5">
          <Scale className="w-4 h-4 text-blue-600" />
          Select Optimization Strategy
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = strat.id === routeStrategy;
            return (
              <div
                key={strat.id}
                onClick={() => setRouteStrategy(strat.id)}
                className={`cursor-pointer rounded-xl p-4 border transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-white border-[#E2E8F0] hover:border-slate-300 text-[#64748B]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-[#172033]'}`}>
                    {strat.name}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-[#64748B]'}`} />
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  {strat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Walking Speed Parameters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            Evacuation Pace / Walking Velocity
          </label>
          <span className="text-xs font-mono font-bold text-blue-600">
            {settings.walkingSpeed} m/s (~{(settings.walkingSpeed * 3.6).toFixed(1)} km/h)
          </span>
        </div>
        <input
          type="range"
          min="0.6"
          max="3.0"
          step="0.1"
          value={settings.walkingSpeed}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updateSettings({ walkingSpeed: val });
            recalculateRoute();
          }}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-[#64748B] mt-2">
          <span>0.6 m/s (Mobility impaired / elderly)</span>
          <span>1.4 m/s (Standard adult brisk walk)</span>
          <span>3.0 m/s (Emergency sprint)</span>
        </div>
      </div>

      {/* Current Planned Path Breakdown */}
      {currentRoute && currentRoute.pathNodeIds.length > 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Waypoint Progression ({currentRoute.pathNodeIds.length} Nodes)
            </span>
            <button
              onClick={() => setActiveTab('building')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline font-semibold"
            >
              View in 3D Model
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentRoute.pathNodeIds.map((nid, idx) => {
              const node = building.nodes.find((n) => n.id === nid);
              const isFirst = idx === 0;
              const isLast = idx === currentRoute.pathNodeIds.length - 1;

              return (
                <React.Fragment key={nid}>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      isFirst
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : isLast
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-[#172033] border-[#E2E8F0]'
                    }`}
                  >
                    {isFirst ? 'START: ' : isLast ? 'EXIT: ' : ''}
                    {node?.name || nid}
                  </div>
                  {!isLast && <ArrowRight className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-xs text-red-800 flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-700 uppercase">No Safe Route Available</div>
            <div>All accessible connections to emergency exits are severed or blocked by hazards.</div>
          </div>
        </div>
      )}
    </div>
  );
};
