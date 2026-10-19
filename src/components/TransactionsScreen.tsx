import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  Receipt, 
  Search, 
  Plus, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  ChevronRight 
} from 'lucide-react';
import { TableSkeleton, EmptyStateView, ErrorStateView } from './FeedbackState';

export const TransactionsScreen: React.FC = () => {
  const { 
    transactions, 
    setSelectedDetail, 
    setNewRecordModal, 
    exportTransactionsCsv, 
    simulationState 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category)));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesParty = t.counterparty.toLowerCase().includes(q);
        const matchesRef = t.referenceCode.toLowerCase().includes(q);
        if (!matchesDesc && !matchesParty && !matchesRef) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, statusFilter, categoryFilter, searchQuery]);

  // Compute ledger summary
  const summary = useMemo(() => {
    const totalInflow = filteredTransactions
      .filter((t) => t.type === 'inflow')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = filteredTransactions
      .filter((t) => t.type === 'outflow')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalInflow,
      totalOutflow,
      net: totalInflow - totalOutflow,
    };
  }, [filteredTransactions]);

  if (simulationState === 'error') {
    return (
      <ErrorStateView
        title="Ledger Communication Timed Out"
        message="Unable to verify cryptographic signature from banking settlement bridge. Retry to reconnect."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Financial Ledger & Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time ledger audit trail, client retainer receipts, and operational vendor disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportTransactionsCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setNewRecordModal('transaction')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Filtered Inflows</span>
          <div className="text-xl font-bold text-emerald-700 font-display font-mono tabular-nums mt-1">
            +${summary.totalInflow.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Filtered Outflows</span>
          <div className="text-xl font-bold text-slate-900 font-display font-mono tabular-nums mt-1">
            -${summary.totalOutflow.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500">Net Ledger Balance</span>
          <div className={`text-xl font-bold font-display font-mono tabular-nums mt-1 ${
            summary.net >= 0 ? 'text-slate-900' : 'text-rose-600'
          }`}>
            ${summary.net.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Inflow/Outflow Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'inflow', label: 'Inflows Only' },
              { id: 'outflow', label: 'Outflows Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  typeFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, party, or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
            <option value="reconciled">Reconciled</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(typeFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim()) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      {simulationState === 'loading' ? (
        <TableSkeleton rows={6} columns={6} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyStateView
          title="No Transactions Found"
          description="There are no transaction records matching your current filters."
          actionLabel="Record New Transaction"
          onAction={() => setNewRecordModal('transaction')}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Date & Ref</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Entity / Counterparty</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method & Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isInflow = tx.type === 'inflow';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedDetail({ type: 'transaction', id: tx.id })}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-900 font-medium">{tx.date}</span>
                        <div className="text-[10px] font-mono text-slate-400">{tx.referenceCode}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block">{tx.description}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {tx.counterparty}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {tx.category}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">{tx.paymentMethod}</span>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {tx.status}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                        <span className={`font-semibold text-xs ${
                          isInflow ? 'text-emerald-700' : 'text-slate-900'
                        }`}>
                          {isInflow ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetail({ type: 'transaction', id: tx.id });
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
