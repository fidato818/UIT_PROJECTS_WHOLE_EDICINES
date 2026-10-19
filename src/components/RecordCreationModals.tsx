import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskPriority, TransactionType, TransactionStatus, OrderStatus } from '../types';
import { X, Plus, Trash2, Calendar, Receipt, Package, CheckSquare } from 'lucide-react';

export const RecordCreationModals: React.FC = () => {
  const { 
    newRecordModal, 
    setNewRecordModal, 
    projects, 
    users, 
    addTask, 
    addTransaction, 
    addOrder 
  } = useApp();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || '');
  const [taskDeadline, setTaskDeadline] = useState('2026-10-19');
  const [taskAssignee, setTaskAssignee] = useState(users[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskHours, setTaskHours] = useState('4.0');
  const [taskCategory, setTaskCategory] = useState('Operational Milestone');
  const [taskNotes, setTaskNotes] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(['Perform baseline diagnostic check']);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Transaction form state
  const [txDesc, setTxDesc] = useState('');
  const [txCategory, setTxCategory] = useState<'Client Retainer' | 'Vendor Services' | 'Logistics' | 'Cloud Infrastructure' | 'Equipment' | 'Payroll Allocation'>('Client Retainer');
  const [txParty, setTxParty] = useState('');
  const [txAmount, setTxAmount] = useState('15000');
  const [txType, setTxType] = useState<TransactionType>('inflow');
  const [txStatus, setTxStatus] = useState<TransactionStatus>('cleared');
  const [txMethod, setTxMethod] = useState<'Wire Transfer' | 'ACH Direct' | 'Corporate Card' | 'Escrow'>('Wire Transfer');
  const [txDate, setTxDate] = useState('2026-10-19');

  // Order form state
  const [ordClient, setOrdClient] = useState('');
  const [ordPromiseDate, setOrdPromiseDate] = useState('2026-10-23');
  const [ordEmail, setOrdEmail] = useState('');
  const [ordAddress, setOrdAddress] = useState('Dock B, Terminal Industrial Way');
  const [ordItems, setOrdItems] = useState<Array<{ name: string; quantity: number; unitPrice: number }>>([
    { name: 'Industrial Telemetry Sensor Kit', quantity: 4, unitPrice: 1850 },
  ]);

  if (!newRecordModal) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      projectId: taskProjectId || projects[0]?.id || 'p-1',
      title: taskTitle.trim(),
      deadline: taskDeadline,
      assignedUserId: taskAssignee || users[0]?.id || 'u-1',
      priority: taskPriority,
      completed: false,
      estimatedHours: parseFloat(taskHours) || 3.0,
      category: taskCategory,
      notes: taskNotes.trim(),
      subtasks: subtasks.filter((s) => s.trim().length > 0),
    });

    setNewRecordModal(null);
    setTaskTitle('');
    setTaskNotes('');
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || !txParty.trim()) return;

    addTransaction({
      date: txDate,
      description: txDesc.trim(),
      category: txCategory,
      counterparty: txParty.trim(),
      amount: parseFloat(txAmount) || 0,
      type: txType,
      status: txStatus,
      paymentMethod: txMethod,
    });

    setNewRecordModal(null);
    setTxDesc('');
    setTxParty('');
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordClient.trim()) return;

    const totalValue = ordItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    addOrder({
      clientName: ordClient.trim(),
      orderDate: '2026-10-19',
      promiseDate: ordPromiseDate,
      value: totalValue,
      status: 'processing',
      riskLevel: 'medium',
      shippingAddress: ordAddress,
      contactEmail: ordEmail || `orders@${ordClient.toLowerCase().replace(/\s+/g, '')}.com`,
      items: ordItems.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    setNewRecordModal(null);
    setOrdClient('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {newRecordModal === 'task' && <CheckSquare className="w-5 h-5 text-slate-800" />}
            {newRecordModal === 'transaction' && <Receipt className="w-5 h-5 text-slate-800" />}
            {newRecordModal === 'order' && <Package className="w-5 h-5 text-slate-800" />}
            <h2 className="text-sm font-bold text-slate-900 font-display">
              {newRecordModal === 'task' && 'Schedule Daily Task & Deadline'}
              {newRecordModal === 'transaction' && 'Record Financial Transaction'}
              {newRecordModal === 'order' && 'Initiate Client Equipment Order'}
            </h2>
          </div>
          <button
            onClick={() => setNewRecordModal(null)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-xs space-y-4">
          {newRecordModal === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Verify pressure relief valve tolerance on Line 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Project</label>
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assignee</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Burndown Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={taskHours}
                    onChange={(e) => setTaskHours(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Subtask Milestones</label>
                <div className="space-y-1.5 mb-2">
                  {subtasks.map((st, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700">
                        {st}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    placeholder="Add step or verification..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSubtaskInput.trim()) {
                          setSubtasks([...subtasks, newSubtaskInput.trim()]);
                          setNewSubtaskInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtaskInput.trim()) {
                        setSubtasks([...subtasks, newSubtaskInput.trim()]);
                        setNewSubtaskInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Operational Notes</label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Specific requirements, calibration tolerances, or inspector contacts..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewRecordModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          )}

          {newRecordModal === 'transaction' && (
            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Transaction Description</label>
                <input
                  type="text"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="e.g. Component Batch 6 Retainer Payment"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Counterparty / Client / Vendor</label>
                  <input
                    type="text"
                    required
                    value={txParty}
                    onChange={(e) => setTxParty(e.target.value)}
                    placeholder="e.g. Apex Industrial Corp"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Direction</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as TransactionType)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="inflow">Inflow (+)</option>
                    <option value="outflow">Outflow (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Client Retainer">Client Retainer</option>
                    <option value="Vendor Services">Vendor Services</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Payroll Allocation">Payroll Allocation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="ACH Direct">ACH Direct</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Escrow">Escrow</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewRecordModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Post Transaction
                </button>
              </div>
            </form>
          )}

          {newRecordModal === 'order' && (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={ordClient}
                  onChange={(e) => setOrdClient(e.target.value)}
                  placeholder="e.g. Cascade Logistics Hub"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Promise Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={ordPromiseDate}
                    onChange={(e) => setOrdPromiseDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Client Contact Email</label>
                  <input
                    type="email"
                    value={ordEmail}
                    onChange={(e) => setOrdEmail(e.target.value)}
                    placeholder="procurement@client.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Shipping Destination</label>
                <input
                  type="text"
                  value={ordAddress}
                  onChange={(e) => setOrdAddress(e.target.value)}
                  placeholder="Warehouse address..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-700">Line Items</label>
                  <button
                    type="button"
                    onClick={() =>
                      setOrdItems([
                        ...ordItems,
                        { name: 'Hardware Sensor Component', quantity: 1, unitPrice: 500 },
                      ])
                    }
                    className="text-[11px] text-slate-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ordItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...ordItems];
                          updated[index].name = e.target.value;
                          setOrdItems(updated);
                        }}
                        placeholder="Item name"
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...ordItems];
                          updated[index].quantity = parseInt(e.target.value) || 1;
                          setOrdItems(updated);
                        }}
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                        title="Quantity"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...ordItems];
                          updated[index].unitPrice = parseFloat(e.target.value) || 0;
                          setOrdItems(updated);
                        }}
                        className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg font-mono tabular-nums"
                        title="Unit price ($)"
                      />
                      {ordItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setOrdItems(ordItems.filter((_, i) => i !== index))}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewRecordModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Initiate Order
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
