import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Settings,
  Eye,
  Sliders,
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto overflow-y-auto h-full text-[#172033] select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            System & Display Settings
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure 3D rendering modes, simulation parameters, and user preferences
          </p>
        </div>
      </div>

      {/* 3D Visualization Toggles */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-4">
          <Eye className="w-4 h-4 text-blue-600" />
          3D Viewport Visualizations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/70 border border-[#E2E8F0]">
            <div>
              <div className="text-xs font-semibold text-[#172033]">Room Labels</div>
              <div className="text-[11px] text-[#64748B]">Floating 3D names over facility spaces</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showRoomLabels}
              onChange={(e) => updateSettings({ showRoomLabels: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/70 border border-[#E2E8F0]">
            <div>
              <div className="text-xs font-semibold text-[#172033]">Perimeter Walls</div>
              <div className="text-[11px] text-[#64748B]">Render structural walls</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showWalls}
              onChange={(e) => updateSettings({ showWalls: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/70 border border-[#E2E8F0]">
            <div>
              <div className="text-xs font-semibold text-[#172033]">Architectural Cutaway</div>
              <div className="text-[11px] text-[#64748B]">Lower wall heights for interior visibility</div>
            </div>
            <input
              type="checkbox"
              checked={settings.cutawayView}
              onChange={(e) => updateSettings({ cutawayView: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/70 border border-[#E2E8F0]">
            <div>
              <div className="text-xs font-semibold text-[#172033]">Navigation Graph</div>
              <div className="text-[11px] text-[#64748B]">Display graph nodes and connection corridors</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showNavGraph}
              onChange={(e) => updateSettings({ showNavGraph: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/70 border border-[#E2E8F0]">
            <div>
              <div className="text-xs font-semibold text-[#172033]">Floor Reference Grid</div>
              <div className="text-[11px] text-[#64748B]">Render 3D coordinate ground grid</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => updateSettings({ showGrid: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/70 border border-[#E2E8F0]">
            <div>
              <div className="text-xs font-semibold text-[#172033]">Render Hazards</div>
              <div className="text-[11px] text-[#64748B]">Display flame clusters and flood pools</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showHazards}
              onChange={(e) => updateSettings({ showHazards: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Measurement Units & Theme */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 mb-4">
          <Sliders className="w-4 h-4 text-blue-600" />
          Unit System & Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
              Measurement Unit System
            </label>
            <select
              value={settings.units}
              onChange={(e) => updateSettings({ units: e.target.value as any })}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500"
            >
              <option value="metric">Metric (Meters / m/s)</option>
              <option value="imperial">Imperial (Feet / fps)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
              Dashboard Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as any })}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#172033] outline-none focus:border-blue-500"
            >
              <option value="light">Architectural Daylight (Active)</option>
              <option value="dark">Charcoal & Deep Slate</option>
              <option value="high-contrast">High Contrast Tactical</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
