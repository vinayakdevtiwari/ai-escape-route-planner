import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, X, Shield, Compass, CheckCircle } from 'lucide-react';

interface RouteIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RouteIntelligenceModal: React.FC<RouteIntelligenceModalProps> = ({ isOpen, onClose }) => {
  const { currentRoute, alternativeRoutes, routeStrategy } = useAppStore();

  if (!isOpen || !currentRoute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
                Local Route Intelligence
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Deterministic AI Engine
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">
                Mathematical optimization and hazard trade-off diagnostic analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Rationale Banner */}
        <div className="my-5 p-4.5 rounded-xl bg-blue-50/60 border border-blue-200">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600" />
            Primary Selection Rationale
          </div>
          <p className="text-sm text-[#172033] leading-relaxed font-medium">
            {currentRoute.explanation}
          </p>
        </div>

        {/* Strategy Comparison Matrix */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            Strategy Comparison Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alternativeRoutes.map(({ strategy, route }) => {
              const isSelected = strategy === routeStrategy;
              return (
                <div
                  key={strategy}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                      {strategy}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Distance:</span>
                      <span className="font-mono font-semibold text-[#172033]">{route.totalDistance}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Est. Time:</span>
                      <span className="font-mono font-semibold text-[#172033]">~{route.estimatedTimeSeconds}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Safety Score:</span>
                      <span
                        className={`font-mono font-bold ${
                          route.safetyScore >= 80
                            ? 'text-emerald-600'
                            : route.safetyScore >= 50
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}
                      >
                        {route.safetyScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Turns:</span>
                      <span className="font-mono text-[#172033]">{route.turnsCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Points */}
        <div>
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Detailed Diagnostic Assessment
          </h3>
          <ul className="space-y-2">
            {currentRoute.detailedAnalysis.map((point, index) => (
              <li
                key={index}
                className="text-xs text-[#172033] flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-[#E2E8F0]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
};
