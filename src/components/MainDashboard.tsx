import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Receipt, 
  Package, 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { StatGridSkeleton, TableSkeleton, ErrorStateView } from './FeedbackState';

export const MainDashboard: React.FC = () => {
  const { 
    currentUser, 
    tasks, 
    projects, 
    transactions, 
    orders, 
    setActiveTab, 
    setSelectedDetail, 
    toggleTaskComplete, 
    setNewRecordModal,
    simulationState 
  } = useApp();

  const today = '2026-10-19';

  // Tasks due today or overdue
  const urgentTasks = tasks.filter(
    (t) => !t.completed && (t.deadline <= today || t.priority === 'urgent')
  ).slice(0, 4);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 4);

  // Active orders in pipeline
  const activeOrders = orders.filter((o) => o.status !== 'delivered').slice(0, 3);

  if (simulationState === 'error') {
    return (
      <ErrorStateView
        title="Dashboard Feed Unavailable"
        message="Could not load the unified dashboard telemetry stream. Check local network connection and retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Operational Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>Operations Command Center</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">Monday, Oct 19, 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
              Welcome back, {currentUser ? currentUser.name : 'Team Member'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              You have <strong className="text-slate-900 font-semibold">{urgentTasks.length} urgent tasks</strong> requiring attention today, 
              and <strong className="text-slate-900 font-semibold">{projects.length} active projects</strong> progressing toward end-of-month milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('workflow')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Manage Task Deadlines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setNewRecordModal('task')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {simulationState === 'loading' ? (
        <StatGridSkeleton />
      ) : (
        /* 4 Key Metric Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('workflow')}
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Pending Deadlines</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
              {tasks.filter((t) => !t.completed).length} open
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {tasks.filter((t) => !t.completed && t.deadline <= today).length} due today or overdue
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('workflow')}
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Active Projects</span>
              <CheckSquare className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
              {projects.length} engagements
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Avg progress: {Math.round(projects.reduce((a, b) => a + b.progress, 0) / projects.length)}%
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('transactions')}
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Monthly Inflow</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
              ${transactions.filter(t => t.type === 'inflow').reduce((a, b) => a + b.amount, 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Cleared client milestone wires</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('orders')}
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Fulfillment Pipeline</span>
              <Package className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
              {orders.filter(o => o.status !== 'delivered').length} orders
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total value: ${orders.reduce((a, b) => a + b.value, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Daily Task Deadlines & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Urgent Daily Deadlines */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-display">
                Immediate Daily Task Deadlines
              </h2>
              <p className="text-xs text-slate-500">
                Critical tasks due today ({today}) or carrying overdue penalty risk.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('workflow')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {urgentTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const isOverdue = task.deadline < today;
              const isToday = task.deadline === today;

              return (
                <div
                  key={task.id}
                  className="py-3 flex items-start justify-between gap-3 group hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <button
                        onClick={() => setSelectedDetail({ type: 'task', id: task.id })}
                        className="text-xs font-semibold text-slate-900 hover:underline text-left"
                      >
                        {task.title}
                      </button>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{project?.name || 'General'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{task.estimatedHours} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-mono rounded font-medium ${
                        isOverdue
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : isToday
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isOverdue ? `Overdue: ${task.deadline}` : `Due: ${task.deadline}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setNewRecordModal('task')}
            className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Daily Task</span>
          </button>
        </div>

        {/* Right 1 Col: Active Project Deadlines */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-display">
                Project Milestone Deadlines
              </h2>
              <p className="text-xs text-slate-500">
                Delivery target dates
              </p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {projects.map((p) => {
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedDetail({ type: 'project', id: p.id })}
                  className="cursor-pointer p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {p.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {p.code}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className="bg-slate-900 h-full rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Deadline: <strong className="text-slate-800 font-mono">{p.deadline}</strong></span>
                    <span className="font-semibold text-slate-800 font-mono">{p.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Recent Financial Transactions & Orders in Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-display">
                Recent Ledger Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Latest cleared and reconciled cash movements.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isInflow = tx.type === 'inflow';
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedDetail({ type: 'transaction', id: tx.id })}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {tx.description}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {tx.counterparty} · {tx.date}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums ${
                        isInflow ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isInflow ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {tx.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Client Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-display">
                Orders Under Fulfillment
              </h2>
              <p className="text-xs text-slate-500">
                Client equipment dispatches and promise dates.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activeOrders.map((ord) => {
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedDetail({ type: 'order', id: ord.id })}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {ord.orderNumber} · {ord.clientName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Promise: <strong className="text-slate-700 font-mono">{ord.promiseDate}</strong> · {ord.items.length} line items
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
                      ${ord.value.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase font-medium">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
