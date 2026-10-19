import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const lastAlert = useAppStore((s) => s.lastAlert);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastAlert) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAlert?.timestamp]);

  if (!visible || !lastAlert) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
  };

  const borders = {
    info: 'border-blue-200 bg-white text-[#172033]',
    warning: 'border-orange-200 bg-white text-[#172033]',
    danger: 'border-red-200 bg-white text-[#172033]',
    success: 'border-emerald-200 bg-white text-[#172033]',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-slideUp select-none">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl ${borders[lastAlert.type]}`}
      >
        {icons[lastAlert.type]}
        <div className="text-xs font-medium leading-relaxed flex-1 text-[#172033]">
          {lastAlert.message}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-[#64748B] hover:text-[#172033] p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
