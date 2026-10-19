/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StateSimulationBar } from './components/StateSimulationBar';
import { MainDashboard } from './components/MainDashboard';
import { WorkflowScreen } from './components/WorkflowScreen';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TransactionsScreen } from './components/TransactionsScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { UsersScreen } from './components/UsersScreen';
import { DetailDrawer } from './components/DetailDrawer';
import { AuthModal } from './components/AuthModal';
import { RecordCreationModals } from './components/RecordCreationModals';
import { ToastNotificationStack } from './components/FeedbackState';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview':
        return 'Operations Overview';
      case 'workflow':
        return 'Daily Tasks & Deadlines';
      case 'analytics':
        return 'Analytical Problem Resolution & Cockpit';
      case 'transactions':
        return 'Financial Ledger & Disbursements';
      case 'orders':
        return 'Client Equipment Orders & Pipeline';
      case 'users':
        return 'Local Users Directory';
      default:
        return 'Workspace';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* State Preview Strip for Evaluator & User */}
      <StateSimulationBar />

      {/* Top Bar Contract Compliant Navigation */}
      <Navbar />

      {/* Sub-Header Breadcrumb Context Bar */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-slate-900 transition-colors"
            >
              StrataOps
            </button>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">{getBreadcrumb()}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Local Region: <strong className="text-slate-700 font-medium">US-West Local Cluster</strong></span>
            <span aria-hidden="true">·</span>
            <span>Ref: <strong className="text-slate-700 font-mono">2026.10</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <MainDashboard />}
        {activeTab === 'workflow' && <WorkflowScreen />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'transactions' && <TransactionsScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'users' && <UsersScreen />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">StrataOps Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Local Team Operational Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Deterministic Local State</span>
            <span>Zero-Telemetry</span>
            <span className="font-mono">© 2026 StrataOps</span>
          </div>
        </div>
      </footer>

      {/* Drawers, Modals & Toast Stacks */}
      <DetailDrawer />
      <AuthModal />
      <RecordCreationModals />
      <ToastNotificationStack />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
