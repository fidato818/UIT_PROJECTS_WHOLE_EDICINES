import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Project,
  Task,
  Transaction,
  Order,
  NavigationTab,
  SimulationState,
  UserRole,
  OrderStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_ORDERS,
} from '../data/seedData';

interface SelectedDetail {
  type: 'task' | 'transaction' | 'order' | 'project' | 'user';
  id: string;
}

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  orders: Order[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
  selectedDetail: SelectedDetail | null;
  setSelectedDetail: (detail: SelectedDetail | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  newRecordModal: 'task' | 'transaction' | 'order' | null;
  setNewRecordModal: (type: 'task' | 'transaction' | 'order' | null) => void;
  notifications: NotificationToast[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  dismissNotification: (id: string) => void;
  // Actions
  toggleTaskComplete: (taskId: string) => void;
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  updateTaskDeadline: (taskId: string, newDeadline: string) => void;
  addTask: (newTask: Omit<Task, 'id' | 'subtasks'> & { subtasks?: string[] }) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'referenceCode'>) => void;
  addOrder: (ord: Omit<Order, 'id' | 'orderNumber'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  loginUser: (userId: string) => void;
  signupUser: (name: string, email: string, role: UserRole, department: string) => void;
  logout: () => void;
  resetToDefaults: () => void;
  exportTransactionsCsv: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'strataops_state_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    if (saved) return JSON.parse(saved);
    return INITIAL_USERS[0]; // Alex Chen as default logged-in local user
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [simulationState, setSimulationState] = useState<SimulationState>('normal');
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newRecordModal, setNewRecordModal] = useState<'task' | 'transaction' | 'order' | null>(null);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissNotification(id);
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          showNotification(
            'success',
            nextCompleted
              ? `Task completed: "${t.title}"`
              : `Task reopened: "${t.title}"`
          );
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const toggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const updateTaskDeadline = (taskId: string, newDeadline: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          showNotification('info', `Deadline updated for "${t.title}" to ${newDeadline}`);
          return { ...t, deadline: newDeadline };
        }
        return t;
      })
    );
  };

  const addTask = (newTask: Omit<Task, 'id' | 'subtasks'> & { subtasks?: string[] }) => {
    const id = `t-${Date.now()}`;
    const subtasks = (newTask.subtasks || []).map((title, index) => ({
      id: `st-${Date.now()}-${index}`,
      title,
      completed: false,
    }));

    const task: Task = {
      ...newTask,
      id,
      subtasks,
    };

    setTasks((prev) => [task, ...prev]);
    showNotification('success', `Task scheduled: "${task.title}" (Due: ${task.deadline})`);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'referenceCode'>) => {
    const prefix = tx.type === 'inflow' ? 'WT' : 'ACH';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `${prefix}-2026-${randNum}`;
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      referenceCode,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showNotification('success', `Recorded ${tx.type === 'inflow' ? 'Inflow' : 'Disbursement'} of $${tx.amount.toLocaleString()} for ${tx.counterparty}`);
  };

  const addOrder = (ord: Omit<Order, 'id' | 'orderNumber'>) => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...ord,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${randNum}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    showNotification('success', `Order ${newOrder.orderNumber} initiated for ${newOrder.clientName}`);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          showNotification('info', `Order ${o.orderNumber} transitioned to ${status.replace('_', ' ')}`);
          return { ...o, status };
        }
        return o;
      })
    );
  };

  const loginUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setAuthModalOpen(false);
      showNotification('success', `Logged in as ${target.name} (${target.role})`);
    }
  };

  const signupUser = (name: string, email: string, role: UserRole, department: string) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      avatar: '/src/assets/images/avatar_sarah_miller_1792409913206.jpg', // Default fallback
      department,
      assignedTaskIds: [],
      onTimeRate: 100,
      capacityPercentage: 40,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    showNotification('success', `Account created for ${name}. Welcome to StrataOps.`);
  };

  const logout = () => {
    setCurrentUser(null);
    showNotification('info', 'Logged out of local session.');
  };

  const resetToDefaults = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setTransactions(INITIAL_TRANSACTIONS);
    setOrders(INITIAL_ORDERS);
    setSimulationState('normal');
    setSelectedDetail(null);
    showNotification('info', 'Reset all records to initial operational data.');
  };

  const exportTransactionsCsv = () => {
    const headers = ['Reference', 'Date', 'Description', 'Category', 'Entity', 'Type', 'Amount', 'Status', 'Payment Method'];
    const rows = transactions.map((t) => [
      t.referenceCode,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      `"${t.counterparty.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.status,
      t.paymentMethod,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StrataOps_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Transactions ledger exported to CSV file.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        tasks,
        transactions,
        orders,
        activeTab,
        setActiveTab,
        simulationState,
        setSimulationState,
        selectedDetail,
        setSelectedDetail,
        authModalOpen,
        setAuthModalOpen,
        newRecordModal,
        setNewRecordModal,
        notifications,
        showNotification,
        dismissNotification,
        toggleTaskComplete,
        toggleSubtaskComplete,
        updateTaskDeadline,
        addTask,
        addTransaction,
        addOrder,
        updateOrderStatus,
        loginUser,
        signupUser,
        logout,
        resetToDefaults,
        exportTransactionsCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
