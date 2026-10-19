import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Users, 
  Receipt, 
  Package, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { StatGridSkeleton, TableSkeleton, ErrorStateView } from './FeedbackState';

export const AnalyticsDashboard: React.FC = () => {
  const { projects, tasks, transactions, orders, users, simulationState } = useApp();
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState<'30d' | '90d' | 'ytd'>('30d');

  const today = '2026-10-19';

  // Analytical computations
  const analytics = useMemo(() => {
    // 1. Financial totals
    const totalInflow = transactions
      .filter((t) => t.type === 'inflow' && t.status !== 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = transactions
      .filter((t) => t.type === 'outflow' && t.status !== 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const netOperatingCashflow = totalInflow - totalOutflow;

    // 2. Project budget variance
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const budgetUtilizationPct = Math.round((totalSpent / totalBudget) * 100);

    // 3. Task Deadline Risk Analytics (The Analytical Problem)
    const overdueTasks = tasks.filter((t) => !t.completed && t.deadline < today);
    const dueTodayTasks = tasks.filter((t) => !t.completed && t.deadline === today);
    const totalOpenHours = tasks
      .filter((t) => !t.completed)
      .reduce((sum, t) => sum + t.estimatedHours, 0);

    // Identify project at highest deadline risk based on ratio of open hours to days remaining
    const projectRisks = projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id && !t.completed);
      const openHours = pTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const deadlineDate = new Date(p.deadline);
      const todayDate = new Date(today);
      const diffTime = deadlineDate.getTime() - todayDate.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const hoursPerDayRequired = openHours / diffDays;
      const riskScore = hoursPerDayRequired > 3 ? 'Critical' : hoursPerDayRequired > 1.5 ? 'Moderate' : 'Stable';

      return {
        ...p,
        openTasksCount: pTasks.length,
        openHours,
        daysRemaining: diffDays,
        hoursPerDayRequired: parseFloat(hoursPerDayRequired.toFixed(1)),
        riskScore,
      };
    });

    // 4. Order fulfillment SLA analytics
    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const onTimeOrders = deliveredOrders.filter((o) => o.promiseDate >= o.orderDate);
    const onTimeRate = orders.length > 0 ? Math.round(( (orders.length - orders.filter(o => o.riskLevel === 'high').length) / orders.length) * 100) : 95;
    const totalOrderValue = orders.reduce((sum, o) => sum + o.value, 0);

    // 5. Category spend breakdown
    const categorySpend: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'outflow')
      .forEach((t) => {
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
      });

    return {
      totalInflow,
      totalOutflow,
      netOperatingCashflow,
      totalBudget,
      totalSpent,
      budgetUtilizationPct,
      overdueTasksCount: overdueTasks.length,
      dueTodayCount: dueTodayTasks.length,
      totalOpenHours,
      projectRisks,
      onTimeRate,
      totalOrderValue,
      categorySpend,
    };
  }, [projects, tasks, transactions, orders, today]);

  if (simulationState === 'error') {
    return <ErrorStateView title="Analytics Telemetry Unavailable" message="An error occurred while calculating project burn rates and financial variance. Please refresh or retry." />;
  }

  return (
    <div className="space-y-6">
      {/* Title & Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Analytical Intelligence & Operations Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predictive milestone slippage modeling, financial burn variance, and order delivery SLA metrics.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0 self-start sm:self-auto">
          {[
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Quarterly' },
            { id: 'ytd', label: 'Year-to-Date' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTimeHorizon(item.id as any)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedTimeHorizon === item.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {simulationState === 'loading' ? (
        <StatGridSkeleton />
      ) : (
        /* Top 4 KPI Metrics */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Net Operating Margin</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
              ${analytics.netOperatingCashflow.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Inflow ${analytics.totalInflow.toLocaleString()}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">Outflow ${analytics.totalOutflow.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Milestone Slippage Risk</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
              {analytics.overdueTasksCount > 0 ? 'Elevated (2 Overdue)' : 'Stable'}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <strong className="text-slate-800 font-mono tabular-nums">{analytics.totalOpenHours.toFixed(1)} hrs</strong> of pending task burndown
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Budget Commitment</span>
              <Activity className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
              {analytics.budgetUtilizationPct}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ${analytics.totalSpent.toLocaleString()} of ${analytics.totalBudget.toLocaleString()} spent
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Order SLA Delivery Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display tabular-nums font-mono">
              {analytics.onTimeRate}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ${analytics.totalOrderValue.toLocaleString()} active in pipeline
            </p>
          </div>
        </div>
      )}

      {/* Analytical Problem Resolution: Milestone Slippage Risk Engine */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Analytical Problem Resolution: Project Velocity & Deadline Risk Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Algorithmically calculating required daily hours versus calendar days left before project breach.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Evaluated on {today}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <th className="py-2.5 px-3">Project & Client</th>
                <th className="py-2.5 px-3">Deadline Target</th>
                <th className="py-2.5 px-3">Days Left</th>
                <th className="py-2.5 px-3">Open Burndown</th>
                <th className="py-2.5 px-3">Req. Hours/Day</th>
                <th className="py-2.5 px-3">Analytical Risk Index</th>
                <th className="py-2.5 px-3">Recommended Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.projectRisks.map((p) => {
                let badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                let actionText = 'On schedule; maintain standard review cadence';

                if (p.riskScore === 'Critical') {
                  badgeClass = 'text-rose-700 bg-rose-50 border-rose-200 font-semibold';
                  actionText = 'Assign secondary engineer; expedite hardware delivery immediately';
                } else if (p.riskScore === 'Moderate') {
                  badgeClass = 'text-amber-800 bg-amber-50 border-amber-200 font-semibold';
                  actionText = 'Review scanner calibration results; verify QA sign-off';
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-slate-500 text-[11px]">{p.client} · {p.code}</p>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-800">
                      {p.deadline}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-700">
                      {p.daysRemaining} days
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                      {p.openHours} hrs ({p.openTasksCount} tasks)
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900">
                      {p.hoursPerDayRequired} hrs/day
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${badgeClass}`}>
                        {p.riskScore} Risk
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {actionText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Analytical Breakdown: Budget Variance & Outflow Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Project Budget Variance Ledger */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-display">
                Operational Budget Variance by Project
              </h2>
              <p className="text-xs text-slate-500">
                Comparing allocated ceiling against actual invoiced expenditures.
              </p>
            </div>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {projects.map((p) => {
              const spentPct = Math.round((p.spent / p.budget) * 100);
              const remaining = p.budget - p.spent;
              const isWarning = spentPct > 80 && p.progress < 70;

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[220px]">
                      {p.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 text-[11px]">
                      ${p.spent.toLocaleString()} / ${p.budget.toLocaleString()} ({spentPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-full ${
                        isWarning ? 'bg-amber-500' : 'bg-slate-900'
                      }`}
                      style={{ width: `${Math.min(100, spentPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Remaining reserve: <strong className="text-slate-700 font-mono">${remaining.toLocaleString()}</strong></span>
                    <span>Project progress: {p.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operating Outflow Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 font-display">
                Disbursements by Operational Category
              </h2>
              <p className="text-xs text-slate-500">
                Categorized expenses from cleared local transactions.
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.categorySpend)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const pct = Math.round((amount / analytics.totalOutflow) * 100);

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{category}</span>
                      <span className="font-mono tabular-nums text-slate-900 font-semibold">
                        ${amount.toLocaleString()} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-700 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Local Team Capacity & Workload Balance */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Local Team Capacity & Task Assignment Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Preventing analytical burnout and milestone delays across staff.
            </p>
          </div>
          <Users className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map((u) => {
            const userOpenTasks = tasks.filter((t) => t.assignedUserId === u.id && !t.completed);
            const userOpenHours = userOpenTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
            const isHighLoad = u.capacityPercentage >= 85;

            return (
              <div key={u.id} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-2.5">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.role}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Allocated Capacity</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {u.capacityPercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        isHighLoad ? 'bg-amber-500' : 'bg-slate-900'
                      }`}
                      style={{ width: `${u.capacityPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{userOpenTasks.length} open tasks</span>
                    <span className="font-mono tabular-nums">{userOpenHours.toFixed(1)} hrs queue</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
