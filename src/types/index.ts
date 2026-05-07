export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Deal {
  id: string;
  customerId: string;
  title: string;
  amount: number;
  stage: DealStage;
  probability: number;
  ownerId: string;
  expectedCloseDate: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  relatedType: 'customer' | 'deal' | 'task' | null;
  relatedId: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  completed: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  relatedType: 'customer' | 'deal' | 'task' | null;
  relatedId: string | null;
  remindAt: string;
  triggered: boolean;
  createdBy: string;
  createdAt: string;
}

export interface DailyTodo {
  id: string;
  content: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  createdBy: string;
  createdAt: string;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';