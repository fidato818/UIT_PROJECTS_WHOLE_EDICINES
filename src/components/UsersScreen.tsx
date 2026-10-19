import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  LogIn, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { TableSkeleton, ErrorStateView } from './FeedbackState';

export const UsersScreen: React.FC = () => {
  const { 
    users, 
    tasks, 
    projects, 
    currentUser, 
    loginUser, 
    setSelectedDetail, 
    setAuthModalOpen, 
    simulationState 
  } = useApp();

  const today = '2026-10-19';

  if (simulationState === 'error') {
    return (
      <ErrorStateView
        title="User Directory Unreachable"
        message="Could not load team capacity and authentication tokens from local store."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Local User Directory & Team Workload
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage local operational accounts, task deadline ownership, and team capacity distribution.
          </p>
        </div>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Switch or Register Local Account</span>
        </button>
      </div>

      {simulationState === 'loading' ? (
        <TableSkeleton rows={4} columns={5} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => {
            const userTasks = tasks.filter((t) => t.assignedUserId === user.id);
            const openTasks = userTasks.filter((t) => !t.completed);
            const overdueTasks = openTasks.filter((t) => t.deadline < today);
            const isCurrentActive = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                  isCurrentActive
                    ? 'border-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Avatar, Name, Role, and Active badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 font-display">{user.name}</h2>
                        {isCurrentActive && (
                          <span className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                            Active Session
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{user.role}</p>
                      <p className="text-[11px] text-slate-400">{user.email} · {user.department}</p>
                    </div>
                  </div>

                  {!isCurrentActive && (
                    <button
                      onClick={() => loginUser(user.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Sign In As
                    </button>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-center mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Capacity</span>
                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                      {user.capacityPercentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">On-Time Rate</span>
                    <p className="text-sm font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
                      {user.onTimeRate}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Open Tasks</span>
                    <p className={`text-sm font-bold font-mono tabular-nums mt-0.5 ${
                      overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-900'
                    }`}>
                      {openTasks.length} {overdueTasks.length > 0 && `(${overdueTasks.length} late)`}
                    </p>
                  </div>
                </div>

                {/* Assigned Active Tasks */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">
                    Active Assigned Milestones ({openTasks.length})
                  </h3>
                  {openTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No open tasks assigned currently.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {openTasks.map((t) => {
                        const isLate = t.deadline < today;
                        const isToday = t.deadline === today;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedDetail({ type: 'task', id: t.id })}
                            className="text-xs p-2 rounded border border-slate-100 hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <span className="font-medium text-slate-800 truncate">{t.title}</span>
                            <span className={`text-[10px] font-mono tabular-nums shrink-0 ${
                              isLate ? 'text-rose-600 font-bold' : isToday ? 'text-amber-700 font-semibold' : 'text-slate-500'
                            }`}>
                              {t.deadline}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
