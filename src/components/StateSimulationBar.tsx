import React from 'react';
import { useApp } from '../context/AppContext';
import { SimulationState } from '../types';
import { RefreshCw, Play, AlertCircle, Inbox, Loader2 } from 'lucide-react';

export const StateSimulationBar: React.FC = () => {
  const { simulationState, setSimulationState, resetToDefaults } = useApp();

  const states: { id: SimulationState; label: string; icon: React.ReactNode }[] = [
    { id: 'normal', label: 'Populated State', icon: <Play className="w-3 h-3 text-emerald-600" /> },
    { id: 'loading', label: 'Loading Skeleton', icon: <Loader2 className="w-3 h-3 text-sky-600" /> },
    { id: 'empty', label: 'Empty State', icon: <Inbox className="w-3 h-3 text-amber-600" /> },
    { id: 'error', label: 'System Error State', icon: <AlertCircle className="w-3 h-3 text-rose-600" /> },
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 tracking-wide text-[11px] uppercase">
            Interactive State Preview:
          </span>
          <div className="inline-flex rounded-md p-0.5 bg-slate-800 border border-slate-700">
            {states.map((st) => (
              <button
                key={st.id}
                onClick={() => setSimulationState(st.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  simulationState === st.id
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {st.icon}
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>Date Reference: <strong className="text-slate-200 font-mono">2026-10-19</strong></span>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1 hover:text-white transition-colors text-slate-300"
            title="Restore original local records"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
