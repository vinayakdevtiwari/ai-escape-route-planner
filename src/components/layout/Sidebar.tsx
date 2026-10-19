import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ActiveSidebarTab } from '../../types';
import {
  LayoutDashboard,
  Building,
  Navigation,
  Flame,
  PencilRuler,
  BarChart3,
  Settings,
} from 'lucide-react';

interface TabItem {
  id: ActiveSidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, hazards } = useAppStore();

  const activeHazardsCount = hazards.filter((h) => h.active).length;

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'building', label: '3D Building', icon: Building },
    { id: 'routes', label: 'Route Planner', icon: Navigation },
    {
      id: 'hazards',
      label: 'Hazard Simulator',
      icon: Flame,
      badge: activeHazardsCount > 0 ? activeHazardsCount : undefined,
    },
    { id: 'editor', label: 'Building Editor', icon: PencilRuler },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-16 md:w-56 bg-white border-r border-[#E2E8F0] flex flex-col justify-between py-4 select-none z-20 shadow-2xs">
      {/* Navigation Items */}
      <nav className="space-y-1 px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {/* Active Blue Accent Bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r" />
              )}

              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-500'
                }`}
              />

              <span className="hidden md:inline font-medium tracking-tight text-[13px]">{tab.label}</span>

              {/* Hazard Count Badge */}
              {tab.badge !== undefined && (
                <span className="ml-auto hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info in Sidebar */}
      <div className="px-3 hidden md:block">
        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-500">
          <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider mb-0.5">
            System Engine
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>Deterministic AI Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
