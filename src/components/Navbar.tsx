import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import { 
  CheckSquare, 
  Layers, 
  BarChart3, 
  Receipt, 
  Package, 
  Users as UsersIcon, 
  LogOut, 
  LogIn, 
  Plus, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    setAuthModalOpen, 
    logout, 
    setNewRecordModal,
    tasks 
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Compute urgent task count for subtle indicator
  const today = '2026-10-19';
  const pendingUrgentCount = tasks.filter(
    (t) => !t.completed && (t.deadline <= today || t.priority === 'urgent')
  ).length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { id: 'workflow', label: 'Daily Tasks & Deadlines', icon: <CheckSquare className="w-4 h-4" />, badge: pendingUrgentCount },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'users', label: 'Local Users', icon: <UsersIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base tracking-tight shadow-sm">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 font-display leading-tight">
                  StrataOps
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  Operations & Analytics
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Action Button */}
            <div className="relative">
              <button
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {quickCreateOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 text-xs"
                  onClick={() => setQuickCreateOpen(false)}
                >
                  <button
                    onClick={() => setNewRecordModal('task')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Create Daily Task</span>
                  </button>
                  <button
                    onClick={() => setNewRecordModal('transaction')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Record Transaction</span>
                  </button>
                  <button
                    onClick={() => setNewRecordModal('order')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span>Initiate Client Order</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <span className="hidden sm:inline font-medium max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-200"
                  />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-40 text-xs"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('users');
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch Local User</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Local Sign In</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
