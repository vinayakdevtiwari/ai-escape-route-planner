import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const {
    building,
    currentRoute,
    alternativeRoutes,
    evacuationSim,
    analyticsHistory,
  } = useAppStore();

  // 1. Prepare Room Type Distribution for PieChart
  const roomTypeCounts: Record<string, number> = {};
  for (const r of building.rooms) {
    roomTypeCounts[r.type] = (roomTypeCounts[r.type] || 0) + 1;
  }
  const roomTypeData = Object.entries(roomTypeCounts).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));
  const PIE_COLORS = ['#2563EB', '#0D9488', '#16A34A', '#EA580C', '#8B5CF6', '#0284C7', '#64748B'];

  // 2. Prepare Strategy Comparison Data for BarChart
  const strategyData = alternativeRoutes.map(({ strategy, route }) => ({
    name: strategy.toUpperCase(),
    Distance: route.totalDistance,
    Safety: route.safetyScore,
    Time: route.estimatedTimeSeconds,
  }));

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto overflow-y-auto h-full text-[#172033] select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Evacuation Analytics & Metrics
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time telemetry recorded across dynamic evacuation cycles
          </p>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center justify-between mb-1">
            <span>Route Distance</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#172033] font-mono">
            {currentRoute?.totalDistance ?? 0}m
          </div>
          <div className="text-[10px] text-[#64748B] mt-0.5">
            {currentRoute?.turnsCount ?? 0} directional turn(s)
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center justify-between mb-1">
            <span>Estimated Evac Time</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 font-mono">
            ~{currentRoute?.estimatedTimeSeconds ?? 0}s
          </div>
          <div className="text-[10px] text-[#64748B] mt-0.5">
            Walking pace: {evacuationSim.evacueeSpeed} m/s
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center justify-between mb-1">
            <span>Safety Composite</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {currentRoute?.safetyScore ?? 100}/100
          </div>
          <div className="text-[10px] text-[#64748B] mt-0.5">
            Hazard exposure: {currentRoute?.hazardExposure ?? 0}%
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center justify-between mb-1">
            <span>Evacuation Status</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 uppercase font-mono truncate">
            {evacuationSim.status.replace('_', ' ')}
          </div>
          <div className="text-[10px] text-[#64748B] mt-0.5">
            Progress: {evacuationSim.progressPercent}% ({evacuationSim.distanceTraveled}m)
          </div>
        </div>
      </div>

      {/* Chart 1: Live Timeline of Simulation Metrics */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4 flex items-center justify-between">
          <span>Simulation Progression Timeline</span>
          <span className="text-[10px] text-[#64748B] font-normal">
            {analyticsHistory.length} data samples recorded
          </span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="time"
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                unit="s"
              />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: '#172033',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="evacueeProgress"
                name="Evac Progress (%)"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="safetyScore"
                name="Route Safety (Score)"
                stroke="#16A34A"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="fireIntensity"
                name="Fire Intensity (%)"
                stroke="#DC2626"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="floodIntensity"
                name="Flood Intensity (%)"
                stroke="#0284C7"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid: Strategy Comparison & Room Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Comparison Bar Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
            Pathfinding Strategy Trade-off Comparison
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={240} minWidth={100}>
              <BarChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#172033',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Distance" fill="#2563EB" name="Distance (m)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Safety" fill="#16A34A" name="Safety Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Type Distribution Pie Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
            Facility Space Distribution ({building.rooms.length} Rooms)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={240} minWidth={100}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="45%"
                  outerRadius={70}
                  innerRadius={30}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {roomTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#172033',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
