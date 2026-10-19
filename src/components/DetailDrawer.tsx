import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  User, 
  FolderGit2, 
  Receipt, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { OrderStatus } from '../types';

export const DetailDrawer: React.FC = () => {
  const { 
    selectedDetail, 
    setSelectedDetail, 
    tasks, 
    projects, 
    transactions, 
    orders, 
    users, 
    toggleTaskComplete, 
    toggleSubtaskComplete, 
    updateTaskDeadline,
    updateOrderStatus 
  } = useApp();

  if (!selectedDetail) return null;

  const today = '2026-10-19';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Result & Detail View · {selectedDetail.type.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setSelectedDetail(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* TASK DETAIL */}
          {selectedDetail.type === 'task' && (() => {
            const task = tasks.find((t) => t.id === selectedDetail.id);
            if (!task) return <p className="text-slate-500 text-xs">Task record not found.</p>;

            const project = projects.find((p) => p.id === task.projectId);
            const assignee = users.find((u) => u.id === task.assignedUserId);
            const isOverdue = !task.completed && task.deadline < today;
            const isToday = !task.completed && task.deadline === today;

            return (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      task.completed 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : isOverdue 
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold' 
                        : isToday 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.completed ? 'Task Closed' : isOverdue ? 'Overdue Deadline' : isToday ? 'Due Today' : 'Scheduled'}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wide font-mono">
                      Priority: {task.priority}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 font-display leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Project: <strong className="text-slate-800">{project?.name || 'Unassigned'}</strong> ({project?.code})
                  </p>
                </div>

                {/* Deadline & Estimation Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Task Deadline</span>
                    </span>
                    <input
                      type="date"
                      value={task.deadline}
                      onChange={(e) => updateTaskDeadline(task.id, e.target.value)}
                      className="px-2 py-1 text-xs font-mono font-semibold bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estimated Burndown</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {task.estimatedHours} hours
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned Engineer</span>
                    </span>
                    <span className="font-medium text-slate-900 flex items-center gap-1.5">
                      {assignee?.avatar && (
                        <img src={assignee.avatar} alt={assignee.name} className="w-4 h-4 rounded-full object-cover" />
                      )}
                      <span>{assignee?.name}</span>
                    </span>
                  </div>
                </div>

                {/* Subtask Milestones */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center justify-between">
                    <span>Subtask Milestones & Acceptance Criteria</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} Done
                    </span>
                  </h3>

                  {task.subtasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No checklist subtasks specified.</p>
                  ) : (
                    <div className="space-y-2">
                      {task.subtasks.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => toggleSubtaskComplete(task.id, st.id)}
                          className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                        >
                          <button className="mt-0.5 text-slate-400">
                            {st.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {task.notes && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 mb-1.5">Technical Brief & Notes</h3>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
                      {task.notes}
                    </div>
                  </div>
                )}

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-200 flex gap-3">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 ${
                      task.completed
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{task.completed ? 'Reopen Task' : 'Mark Task as Completed'}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* TRANSACTION DETAIL */}
          {selectedDetail.type === 'transaction' && (() => {
            const tx = transactions.find((t) => t.id === selectedDetail.id);
            if (!tx) return <p className="text-slate-500 text-xs">Transaction not found.</p>;

            const isInflow = tx.type === 'inflow';

            return (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      Ref: {tx.referenceCode}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-700">
                      {tx.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {tx.description}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Entity: <strong className="text-slate-800">{tx.counterparty}</strong>
                  </p>
                </div>

                {/* Amount Box */}
                <div className={`p-5 rounded-xl border ${
                  isInflow ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-xs text-slate-500">Total Transacted Value</span>
                  <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                    isInflow ? 'text-emerald-700' : 'text-slate-900'
                  }`}>
                    {isInflow ? '+' : '-'}${tx.amount.toLocaleString()} USD
                  </div>
                </div>

                {/* Detailed Spec Table */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Settlement Date</span>
                    <span className="font-mono text-slate-800 font-medium">{tx.date}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Operational Category</span>
                    <span className="text-slate-800 font-medium">{tx.category}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Payment Instrument</span>
                    <span className="text-slate-800 font-medium">{tx.paymentMethod}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Direction</span>
                    <span className="capitalize font-medium text-slate-800">{tx.type}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ORDER DETAIL */}
          {selectedDetail.type === 'order' && (() => {
            const ord = orders.find((o) => o.id === selectedDetail.id);
            if (!ord) return <p className="text-slate-500 text-xs">Order not found.</p>;

            return (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-700">
                      {ord.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Placed: {ord.orderDate}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {ord.clientName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact: {ord.contactEmail} · {ord.shippingAddress}
                  </p>
                </div>

                {/* Status selector */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Fulfillment Pipeline Stage
                  </label>
                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium text-slate-800"
                  >
                    <option value="processing">Processing</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="on_hold">On Hold</option>
                  </select>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Promise Deadline: <strong className="font-mono text-slate-700">{ord.promiseDate}</strong></span>
                    <span>Risk: <strong className="capitalize text-slate-700">{ord.riskLevel}</strong></span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 mb-2">
                    Ordered Hardware Assemblies & Items ({ord.items.length})
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                          <th className="py-2 px-3">Item Description</th>
                          <th className="py-2 px-3 text-right">Qty</th>
                          <th className="py-2 px-3 text-right">Unit Price</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ord.items.map((i) => (
                          <tr key={i.id}>
                            <td className="py-2 px-3 font-medium text-slate-800">{i.name}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{i.quantity}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">${i.unitPrice.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                              ${(i.quantity * i.unitPrice).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                          <td colSpan={3} className="py-2 px-3 text-right">Total Order Valuation:</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-900">
                            ${ord.value.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PROJECT DETAIL */}
          {selectedDetail.type === 'project' && (() => {
            const proj = projects.find((p) => p.id === selectedDetail.id);
            if (!proj) return <p className="text-slate-500 text-xs">Project not found.</p>;

            const projectTasks = tasks.filter((t) => t.projectId === proj.id);

            return (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      {proj.code}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-[11px] uppercase tracking-wide font-medium text-slate-600">
                      {proj.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {proj.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Client: <strong className="text-slate-800">{proj.client}</strong> · {proj.category}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Milestone Deadline</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">{proj.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Financial Burn</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ${proj.spent.toLocaleString()} / ${proj.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-800 mb-2">
                    Associated Tasks ({projectTasks.length})
                  </h3>
                  <div className="space-y-1.5">
                    {projectTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedDetail({ type: 'task', id: t.id })}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className={`font-medium truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {t.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">{t.deadline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};
