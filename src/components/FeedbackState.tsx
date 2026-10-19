import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, RefreshCw, Plus, CheckCircle2, Info, X } from 'lucide-react';

export const ErrorStateView: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Service Cluster Communication Interrupted',
  message = 'Failed to synchronize analytical ledger telemetry with regional database node. Local cached records remain intact.',
  onRetry,
}) => {
  const { setSimulationState } = useApp();

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center my-6 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 font-display mb-1">{title}</h3>
      <p className="text-xs text-rose-800 leading-relaxed mb-6 max-w-md mx-auto">{message}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            if (onRetry) onRetry();
            setSimulationState('normal');
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 rounded-lg hover:bg-rose-800 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
        <button
          onClick={() => setSimulationState('normal')}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span>Dismiss Simulation</span>
        </button>
      </div>
    </div>
  );
};

export const EmptyStateView: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center my-6">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Plus className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 font-display mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 animate-pulse">
      <div className="bg-slate-50/80 px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3.5 flex items-center gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className={`h-3 bg-slate-100 rounded ${
                c === 0 ? 'w-1/3 flex-none' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const StatGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="h-3.5 bg-slate-200 rounded w-1/2" />
          <div className="h-7 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};

export const ToastNotificationStack: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        let borderClass = 'border-slate-200 bg-white text-slate-800';
        let IconComponent = Info;
        let iconColor = 'text-slate-500';

        if (n.type === 'success') {
          borderClass = 'border-emerald-200 bg-emerald-50 text-emerald-900';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (n.type === 'error') {
          borderClass = 'border-rose-200 bg-rose-50 text-rose-900';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-600';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto border rounded-lg p-3 shadow-md flex items-start gap-2.5 transition-all text-xs ${borderClass}`}
          >
            <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 font-medium leading-relaxed">{n.message}</div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
