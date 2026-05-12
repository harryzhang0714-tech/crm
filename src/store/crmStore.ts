import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, Customer, Deal, Task, Reminder, DailyTodo } from '../types';

const DEFAULT_MEMBER: Member = {
  id: 'admin',
  name: '主账号',
  email: 'admin@company.com',
  role: '管理员',
  color: '#E8602C',
};

interface CRMStore {
  currentUser: Member | null;
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  reminders: Reminder[];
  dailyTodos: DailyTodo[];
  login: (name: string) => void;
  logout: () => void;
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
    notes: '对ERP系统有兴趣，预算50万', createdBy: ADMIN, createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'c2', name: '周婷', company: '东方贸易', phone: '139-0002-5678',
    email: 'zhout@dongfang.com', industry: '贸易', status: 'contacted',
    notes: '主营进出口，需要供应链管理系统', createdBy: ADMIN, createdAt: '2026-04-05T10:00:00Z', updatedAt: '2026-04-29T10:00:00Z',
  },
  {
    id: 'c3', name: '吴昊', company: '蓝海制造', phone: '137-0003-9012',
    email: 'wuhao@lanhai.com', industry: '制造', status: 'new',
    notes: '工厂扩产，希望了解智能排产方案', createdBy: ADMIN, createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-30T10:00:00Z',
  },
  {
    id: 'c4', name: '孙丽', company: '星辰教育', phone: '136-0004-3456',
    email: 'sunli@xingchen.com', industry: '教育', status: 'qualified',
    notes: '在线教育平台合作，已进入商务谈判', createdBy: ADMIN, createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-04-25T10:00:00Z',
  },
  {
    id: 'c5', name: '黄勇', company: '中瑞物流', phone: '135-0005-7890',
    email: 'huangy@zhongrui.com', industry: '物流', status: 'lost',
    notes: '对比了3家供应商，最终选了别家', createdBy: ADMIN, createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
];

const sampleDeals: Deal[] = [
  {
    id: 'd1', customerId: 'c1', title: '伟创科技ERP项目', amount: 500000,
    stage: 'proposal', probability: 60, ownerId: ADMIN,
    expectedCloseDate: '2026-05-30', notes: '等待客户内部审批', createdBy: ADMIN,
    createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'd2', customerId: 'c4', title: '星辰教育平台合作', amount: 280000,
    stage: 'qualified', probability: 40, ownerId: ADMIN,
    expectedCloseDate: '2026-06-15', notes: '商务条款谈判中', createdBy: ADMIN,
    createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-25T10:00:00Z',
  },
  {
    id: 'd3', customerId: 'c2', title: '东方贸易供应链系统', amount: 180000,
    stage: 'lead', probability: 20, ownerId: ADMIN,
    expectedCloseDate: '2026-07-01', notes: '初步需求对接完成', createdBy: ADMIN,
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-29T10:00:00Z',
  },
  {
    id: 'd4', customerId: 'c3', title: '蓝海制造智能排产', amount: 350000,
    stage: 'lead', probability: 20, ownerId: ADMIN,
    expectedCloseDate: '2026-08-01', notes: '技术方案已发送', createdBy: ADMIN,
    createdAt: '2026-04-22T10:00:00Z', updatedAt: '2026-04-30T10:00:00Z',
  },
  {
    id: 'd5', customerId: 'c1', title: '伟创科技年度维保', amount: 60000,
    stage: 'won', probability: 100, ownerId: ADMIN,
    expectedCloseDate: '2026-04-15', notes: '已签约', createdBy: ADMIN,
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-15T10:00:00Z',
  },
];

const sampleTasks: Task[] = [
  {
    id: 't1', title: '准备伟创科技方案PPT', description: '包含报价单及实施计划',
    assigneeId: ADMIN, relatedType: 'deal', relatedId: 'd1',
    priority: 'high', dueDate: '2026-05-10', completed: false,
    createdBy: ADMIN, createdAt: '2026-04-28T10:00:00Z', updatedAt: '2026-04-28T10:00:00Z',
    comments: [],
  },
  {
    id: 't2', title: '东方贸易客户拜访', description: '线下见面，进一步了解需求',
    assigneeId: ADMIN, relatedType: 'customer', relatedId: 'c2',
    priority: 'medium', dueDate: '2026-05-12', completed: false,
    createdBy: ADMIN, createdAt: '2026-04-29T10:00:00Z', updatedAt: '2026-04-29T10:00:00Z',
    comments: [],
  },
  {
    id: 't3', title: '星辰教育合同条款复核', description: '法务确认后发送给客户',
    assigneeId: ADMIN, relatedType: 'deal', relatedId: 'd2',
    priority: 'high', dueDate: '2026-05-08', completed: false,
    createdBy: ADMIN, createdAt: '2026-04-30T10:00:00Z', updatedAt: '2026-04-30T10:00:00Z',
    comments: [],
  },
];

const sampleReminders: Reminder[] = [
  {
    id: 'r1', title: '伟创科技方案提交', description: '需在5月10日前提交完整方案',
    relatedType: 'deal', relatedId: 'd1',
    remindAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    triggered: false, createdBy: ADMIN, createdAt: new Date().toISOString(),
  },
  {
    id: 'r2', title: '东方贸易客户拜访', description: '5月12日实地拜访',
    relatedType: 'task', relatedId: 't2',
    remindAt: '2026-05-12T09:00:00+08:00',
    triggered: false, createdBy: ADMIN, createdAt: new Date().toISOString(),
  },
];

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      customers: sampleCustomers,
      deals: sampleDeals,
      tasks: sampleTasks,
      reminders: sampleReminders,
      dailyTodos: [],

      login: (_name: string) => {
        set({ currentUser: DEFAULT_MEMBER });
      },

      logout: () => set({ currentUser: null }),

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
        reminders: [...s.reminders, { ...r, id: 'r' + genId(), createdAt: new Date().toISOString(), triggered: false }],
      })),

      triggerReminder: (id) => set(s => ({
        reminders: s.reminders.map(r => r.id === id ? { ...r, triggered: true } : r),
      })),

      deleteReminder: (id) => set(s => ({
        reminders: s.reminders.filter(r => r.id !== id),
      })),

      getCustomerById: (id) => get().customers.find(c => c.id === id),
      getDealById: (id) => get().deals.find(d => d.id === id),

      addDailyTodo: (content) => set(s => {
        const today = todayStr();
        return {
          dailyTodos: [
            ...s.dailyTodos,
            {
              id: 'dt' + genId(),
              content,
              completed: false,
              date: today,
              createdBy: ADMIN,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }),

      toggleDailyTodo: (id) => set(s => ({
        dailyTodos: s.dailyTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
      })),

      deleteDailyTodo: (id) => set(s => ({
        dailyTodos: s.dailyTodos.filter(t => t.id !== id),
      })),

      refreshDailyTodos: () => set(s => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().slice(0, 10);
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