export type UserRole = 'Operations Lead' | 'Analytics PM' | 'Financial Ops Lead' | 'Supply Coordinator' | 'Staff Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  assignedTaskIds: string[];
  onTimeRate: number; // e.g. 96 (%)
  capacityPercentage: number; // e.g. 78 (%)
}

export type ProjectStatus = 'planning' | 'active' | 'in_review' | 'completed' | 'delayed';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  client: string;
  code: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  progress: number; // 0-100
  deadline: string; // YYYY-MM-DD
  startDate: string;
  teamIds: string[];
  riskLevel: RiskLevel;
  description: string;
  category: string;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  assignedUserId: string;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  category: string;
  notes: string;
  subtasks: Subtask[];
}

export type TransactionType = 'inflow' | 'outflow';
export type TransactionStatus = 'cleared' | 'pending' | 'reconciled';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: 'Client Retainer' | 'Vendor Services' | 'Logistics' | 'Cloud Infrastructure' | 'Equipment' | 'Payroll Allocation';
  counterparty: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: 'Wire Transfer' | 'ACH Direct' | 'Corporate Card' | 'Escrow';
  referenceCode: string;
}

export type OrderStatus = 'processing' | 'quality_check' | 'shipped' | 'delivered' | 'on_hold';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  orderDate: string; // YYYY-MM-DD
  promiseDate: string; // Deadline YYYY-MM-DD
  value: number;
  status: OrderStatus;
  riskLevel: RiskLevel;
  items: OrderItem[];
  shippingAddress: string;
  contactEmail: string;
}

export type NavigationTab = 
  | 'overview' 
  | 'workflow' 
  | 'analytics' 
  | 'transactions' 
  | 'orders' 
  | 'users'
  | 'states_demo';

export type SimulationState = 'normal' | 'loading' | 'empty' | 'error';
