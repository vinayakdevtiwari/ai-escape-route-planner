import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Building3DView } from './components/building/Building3DView';
import { RightInfoPanel } from './components/dashboard/RightInfoPanel';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { RoutePlannerPanel } from './components/routes/RoutePlannerPanel';
import { HazardSimulatorPanel } from './components/hazards/HazardSimulatorPanel';
import { BuildingEditorPanel } from './components/editor/BuildingEditorPanel';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { Toast } from './components/ui/Toast';

export const App: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F5F7FA] text-[#172033] overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative bg-[#F5F7FA]">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Central Workspace */}
        <main className="flex-1 relative flex overflow-hidden bg-[#F5F7FA]">
          {/* We keep the 3D Building mounted in DOM so WebGL context is preserved when switching tabs */}
          <div
            className={`w-full h-full ${
              activeTab === 'building' ? 'block' : 'hidden'
            }`}
          >
            <Building3DView />
          </div>

          {/* Tab Content Overlays */}
          {activeTab === 'dashboard' && (
            <div className="w-full h-full overflow-y-auto bg-[#F5F7FA]">
              <DashboardOverview />
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="w-full h-full overflow-y-auto bg-[#F5F7FA]">
              <RoutePlannerPanel />
            </div>
          )}

          {activeTab === 'hazards' && (
            <div className="w-full h-full overflow-y-auto bg-[#F5F7FA]">
              <HazardSimulatorPanel />
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="w-full h-full overflow-y-auto bg-[#F5F7FA]">
              <BuildingEditorPanel />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="w-full h-full overflow-y-auto bg-[#F5F7FA]">
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="w-full h-full overflow-y-auto bg-[#F5F7FA]">
              <SettingsPanel />
            </div>
          )}
        </main>

        {/* Right Information Panel (Always visible in 3D Building tab, or can be toggled) */}
        {activeTab === 'building' && <RightInfoPanel />}
      </div>

      {/* Floating System Toast Alerts */}
      <Toast />
    </div>
  );
};

export default App;
