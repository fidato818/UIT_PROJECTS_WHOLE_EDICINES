import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ChevronRight,
  Filter 
} from 'lucide-react';
import { TableSkeleton, EmptyStateView, ErrorStateView } from './FeedbackState';

export const OrdersScreen: React.FC = () => {
  const { 
    orders, 
    setSelectedDetail, 
    setNewRecordModal, 
    updateOrderStatus, 
    simulationState 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = '2026-10-19';

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = o.clientName.toLowerCase().includes(q);
        const matchesNum = o.orderNumber.toLowerCase().includes(q);
        if (!matchesClient && !matchesNum) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const pipelineSummary = useMemo(() => {
    return {
      processing: orders.filter((o) => o.status === 'processing').length,
      quality_check: orders.filter((o) => o.status === 'quality_check').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      on_hold: orders.filter((o) => o.status === 'on_hold').length,
      totalValue: orders.reduce((acc, o) => acc + o.value, 0),
    };
  }, [orders]);

  if (simulationState === 'error') {
    return (
      <ErrorStateView
        title="Fulfillment Logistics Pipeline Unreachable"
        message="Unable to communicate with local logistics staging gateway. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Client Order Fulfillment & Logistics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track hardware dispatches, quality inspections, and milestone delivery deadlines.
          </p>
        </div>

        <button
          onClick={() => setNewRecordModal('order')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Initiate Client Order</span>
        </button>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'processing', label: 'Processing', count: pipelineSummary.processing, icon: Clock },
          { id: 'quality_check', label: 'Quality Check', count: pipelineSummary.quality_check, icon: AlertTriangle },
          { id: 'shipped', label: 'In Transit', count: pipelineSummary.shipped, icon: Truck },
          { id: 'delivered', label: 'Delivered', count: pipelineSummary.delivered, icon: CheckCircle2 },
          { id: 'on_hold', label: 'On Hold', count: pipelineSummary.on_hold, icon: AlertTriangle },
        ].map((step) => {
          const isSelected = statusFilter === step.id;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => setStatusFilter(isSelected ? 'all' : (step.id as any))}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-medium">{step.label}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-bold text-slate-900 font-display tabular-nums">
                {step.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order # or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
          <span>Total pipeline value:</span>
          <span className="font-mono font-bold text-slate-900 text-xs">
            ${pipelineSummary.totalValue.toLocaleString()}
          </span>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-xs text-slate-700 underline ml-2"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {simulationState === 'loading' ? (
        <TableSkeleton rows={5} columns={6} />
      ) : filteredOrders.length === 0 ? (
        <EmptyStateView
          title="No Orders in this View"
          description="There are currently no client equipment orders matching this pipeline stage."
          actionLabel="Initiate New Order"
          onAction={() => setNewRecordModal('order')}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Order # & Client</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Promise Deadline</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Order Value</th>
                  <th className="py-3 px-4 w-12 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const isDueToday = ord.promiseDate === today;
                  const isOverdue = ord.promiseDate < today && ord.status !== 'delivered';

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedDetail({ type: 'order', id: ord.id })}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-900 block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">{ord.clientName}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {ord.orderDate}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-medium text-slate-800">
                          {ord.promiseDate}
                        </span>
                        <div className="text-[10px]">
                          {isDueToday && <span className="text-amber-700 font-semibold">Due today</span>}
                          {isOverdue && <span className="text-rose-600 font-semibold">Overdue promise</span>}
                          {!isDueToday && !isOverdue && <span className="text-slate-400">On schedule</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-medium">
                          {ord.items.length} product lines
                        </span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {ord.items.map((i) => i.name).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={ord.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 focus:outline-none"
                        >
                          <option value="processing">Processing</option>
                          <option value="quality_check">Quality Check</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                        ${ord.value.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetail({ type: 'order', id: ord.id });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
