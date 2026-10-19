import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { sampleScenarios } from '../../data/sampleScenarios';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertOctagon,
  Building2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    building,
    evacuationSim,
    settings,
    hazards,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSimulationSpeed,
    loadScenario,
  } = useAppStore();

  const isRunning = evacuationSim.status === 'running';
  const isPaused = evacuationSim.status === 'paused';
  const isHalted = evacuationSim.status === 'blocked_halted';
  const isCompleted = evacuationSim.status === 'completed';
  const activeHazardsCount = hazards.filter((h) => h.active).length;

  const handleStartOrPause = () => {
    if (isRunning) {
      pauseSimulation();
    } else if (isPaused) {
      resumeSimulation();
    } else {
      startSimulation();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-5 flex items-center justify-between z-30 select-none shadow-xs">
      {/* Brand & Building Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#172033] tracking-tight flex items-center gap-1.5">
              <span>AI Escape Route</span>
              <span className="text-blue-600">Planner 3D</span>
            </h1>
            <p className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{building.name}</span>
            </p>
          </div>
        </div>

        {/* Preset Scenarios Dropdown */}
        <div className="hidden lg:flex items-center ml-4">
          <select
            onChange={(e) => loadScenario(e.target.value)}
            defaultValue=""
            className="bg-white border border-slate-200 text-xs text-[#172033] font-medium rounded-lg px-3 py-1.5 outline-none focus:border-blue-600 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
          >
            <option value="" disabled>
              Select Scenario Preset...
            </option>
            {sampleScenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Central Status Indicators */}
      <div className="hidden sm:flex items-center gap-2.5">
        {/* Active Hazards Badge */}
        {activeHazardsCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>{activeHazardsCount} Active Hazard{activeHazardsCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Evacuation State Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            isHalted
              ? 'bg-red-50 text-red-700 border-red-200'
              : isCompleted
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isRunning
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : isPaused
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          {isHalted ? (
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-blue-600 animate-ping' : 'bg-slate-400'
              }`}
            />
          )}
          <span className="uppercase text-[11px] tracking-wide">
            {evacuationSim.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Control Actions & Speed */}
      <div className="flex items-center gap-3">
        {/* Speed Segmented Controller */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                settings.simulationSpeed === spd
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={`Simulation speed: ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Primary Evacuate / Pause Button */}
        <button
          onClick={handleStartOrPause}
          disabled={isCompleted}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 shadow-sm transition-all ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : isCompleted
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>EVACUATE</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={resetSimulation}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
          title="Reset Evacuation Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
