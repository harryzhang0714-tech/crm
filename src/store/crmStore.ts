import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, Customer, Deal, Task, Reminder, DailyTodo } from '../types';

const DEFAULT_MEMBER: Member = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@company.com',
  role: '管理员',
  color: '#E8602C',
};

interface CRMStore {
  currentUser: Member | null;
  teamMembers: Member[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  reminders: Reminder[];
  dailyTodos: DailyTodo[];
  login: (name: string) => void;
  logout: () => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  addMember: (m: Omit<Member, 'id'>) => void;
  deleteMember: (id: string) => void;
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, content: string) => void;
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt' | 'triggered'>) => void;
  triggerReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getDealById: (id: string) => Deal | undefined;
  addDailyTodo: (content: string) => void;
  toggleDailyTodo: (id: string) => void;
  deleteDailyTodo: (id: string) => void;
  refreshDailyTodos: () => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const ADMIN = 'admin';

const sampleCustomers: Customer[] = [
  {
    id: 'c1', name: '赵伟', company: '伟创科技', phone: '138-0001-1234',
    email: 'zhao@weichuang.com', industry: '科技', status: 'qualified',
    notes: '', createdBy: 'admin',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2', name: '周莉', company: '周氏实业', phone: '139-0002-5678',
    email: 'zhou@zhoushiye.com', industry: '制造', status: 'contacted',
    notes: '', createdBy: 'admin',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const sampleDeals: Deal[] = [
  {
    id: 'd1', customerId: 'c1', title: '伟创科技ERP系统采购', amount: 128000,
    stage: 'qualified', probability: 60, ownerId: 'admin',
    expectedCloseDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    notes: '', createdBy: 'admin',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const sampleTasks: Task[] = [
  {
    id: 't1', title: '跟进伟创科技报价', description: '',
    assigneeId: 'admin', relatedType: 'deal', relatedId: 'd1',
    priority: 'high', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    completed: false, createdBy: 'admin',
    comments: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const sampleReminders: Reminder[] = [
  {
    id: 'r1', title: '伟创科技项目报价截止日', description: '',
    relatedType: 'deal', relatedId: 'd1',
    remindAt: new Date(Date.now() + 86400000).toISOString(),
    triggered: false, createdBy: 'admin', createdAt: new Date().toISOString(),
  },
];

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      teamMembers: [DEFAULT_MEMBER],

      customers: sampleCustomers,
      deals: sampleDeals,
      tasks: sampleTasks,
      reminders: sampleReminders,
      dailyTodos: [],

      login: (_name: string) => {
        set({ currentUser: DEFAULT_MEMBER });
      },

      logout: () => set({ currentUser: null }),

      updateMember: (id, data) => set(s => ({
        teamMembers: s.teamMembers.map(m => m.id === id ? { ...m, ...data } : m),
        currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...data } : s.currentUser,
      })),

      addMember: (m) => set(s => ({
        teamMembers: [...s.teamMembers, { ...m, id: 'm' + genId() }],
      })),

      deleteMember: (id) => set(s => ({
        teamMembers: s.teamMembers.filter(m => m.id !== id),
        currentUser: s.currentUser?.id === id ? null : s.currentUser,
      })),

      addCustomer: (c) => set(s => ({
        customers: [...s.customers, { ...c, id: 'c' + genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      })),

      updateCustomer: (id, data) => set(s => ({
        customers: s.customers.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c),
      })),

      deleteCustomer: (id) => set(s => ({
        customers: s.customers.filter(c => c.id !== id),
        deals: s.deals.filter(d => d.customerId !== id),
        tasks: s.tasks.filter(t => t.relatedId !== id || t.relatedType !== 'customer'),
      })),

      addDeal: (d) => set(s => ({
        deals: [...s.deals, { ...d, id: 'd' + genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      })),

      updateDeal: (id, data) => set(s => ({
        deals: s.deals.map(d => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d),
      })),

      deleteDeal: (id) => set(s => ({
        deals: s.deals.filter(d => d.id !== id),
        tasks: s.tasks.filter(t => t.relatedId !== id || t.relatedType !== 'deal'),
      })),

      addTask: (t) => set(s => ({
        tasks: [...s.tasks, { ...t, id: 't' + genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [] }],
      })),

      updateTask: (id, data) => set(s => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t),
      })),

      deleteTask: (id) => set(s => ({
        tasks: s.tasks.filter(t => t.id !== id),
      })),

      addComment: (taskId, content) => set(s => {
        const user = s.currentUser;
        if (!user) return s;
        return {
          tasks: s.tasks.map(t => t.id === taskId ? {
            ...t,
            comments: [...t.comments, { id: 'cm' + genId(), authorId: user.id, content, createdAt: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          } : t),
        };
      }),

      addReminder: (r) => set(s => ({
        reminders: [...s.reminders, { ...r, id: 'r' + genId(), triggered: false, createdAt: new Date().toISOString() }],
      })),

      triggerReminder: (id) => set(s => ({
        reminders: s.reminders.map(r => r.id === id ? { ...r, triggered: true } : r),
      })),

      deleteReminder: (id) => set(s => ({
        reminders: s.reminders.filter(r => r.id !== id),
      })),

      getCustomerById: (id) => get().customers.find(c => c.id === id),
      getDealById: (id) => get().deals.find(d => d.id === id),

      addDailyTodo: (content: string) => set(s => ({
        dailyTodos: [...s.dailyTodos, { id: 'dt' + genId(), content, completed: false, date: todayStr(), createdBy: s.currentUser?.id || ADMIN, createdAt: new Date().toISOString() }],
      })),

      toggleDailyTodo: (id) => set(s => ({
        dailyTodos: s.dailyTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
      })),

      deleteDailyTodo: (id) => set(s => ({
        dailyTodos: s.dailyTodos.filter(t => t.id !== id),
      })),

      refreshDailyTodos: () => set(s => {
        const today = todayStr();
        const kept = s.dailyTodos.filter(t => t.completed || t.date === today);
        const fromBefore = s.dailyTodos.filter(t => !t.completed && t.date < today);
        const carried = fromBefore.map(t => ({ ...t, id: 'dt' + genId(), date: today }));
        return { dailyTodos: [...kept, ...carried] };
      }),
    }),
    { name: 'teamcrm-store' }
  )
);

export { DEFAULT_MEMBER };