import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, Customer, Deal, Task, Reminder, DailyTodo } from '../types';

const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: 'Harry', email: 'harry@company.com', role: '管理员', color: '#E8602C' },
  { id: 'm2', name: '李娜', email: 'lina@company.com', role: '客户经理', color: '#3B82F6' },
  { id: 'm3', name: '王强', email: 'wang@company.com', role: '商务专员', color: '#22C55E' },
  { id: 'm4', name: '陈晓', email: 'chen@company.com', role: '运营支持', color: '#F59E0B' },
  { id: 'm5', name: '刘芳', email: 'liufang@company.com', role: '客服专员', color: '#8B5CF6' },
];

const TEAM_MEMBERS = DEFAULT_MEMBERS;

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
  addMember: (m: Omit<Member, 'id'>) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
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
  getMembers: () => Member[];
  getCustomerById: (id: string) => Customer | undefined;
  getDealById: (id: string) => Deal | undefined;
  addDailyTodo: (content: string) => void;
  toggleDailyTodo: (id: string) => void;
  deleteDailyTodo: (id: string) => void;
  refreshDailyTodos: () => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);

const todayStr = () => new Date().toISOString().slice(0, 10);

const sampleCustomers: Customer[] = [
  {
    id: 'c1', name: '赵伟', company: '伟创科技', phone: '138-0001-1234',
    email: 'zhao@weichuang.com', industry: '科技', status: 'qualified',
    notes: '对ERP系统有兴趣，预算50万', createdBy: 'm1', createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'c2', name: '周婷', company: '东方贸易', phone: '139-0002-5678',
    email: 'zhout@dongfang.com', industry: '贸易', status: 'contacted',
    notes: '主营进出口，需要供应链管理系统', createdBy: 'm2', createdAt: '2026-04-05T10:00:00Z', updatedAt: '2026-04-29T10:00:00Z',
  },
  {
    id: 'c3', name: '吴昊', company: '蓝海制造', phone: '137-0003-9012',
    email: 'wuhao@lanhai.com', industry: '制造', status: 'new',
    notes: '工厂扩产，希望了解智能排产方案', createdBy: 'm1', createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-30T10:00:00Z',
  },
  {
    id: 'c4', name: '孙丽', company: '星辰教育', phone: '136-0004-3456',
    email: 'sunli@xingchen.com', industry: '教育', status: 'qualified',
    notes: '在线教育平台合作，已进入商务谈判', createdBy: 'm3', createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-04-25T10:00:00Z',
  },
  {
    id: 'c5', name: '黄勇', company: '中瑞物流', phone: '135-0005-7890',
    email: 'huangy@zhongrui.com', industry: '物流', status: 'lost',
    notes: '对比了3家供应商，最终选了别家', createdBy: 'm2', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
];

const sampleDeals: Deal[] = [
  {
    id: 'd1', customerId: 'c1', title: '伟创科技ERP项目', amount: 500000,
    stage: 'proposal', probability: 60, ownerId: 'm1',
    expectedCloseDate: '2026-05-30', notes: '等待客户内部审批', createdBy: 'm1',
    createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'd2', customerId: 'c4', title: '星辰教育平台合作', amount: 280000,
    stage: 'qualified', probability: 40, ownerId: 'm3',
    expectedCloseDate: '2026-06-15', notes: '商务条款谈判中', createdBy: 'm3',
    createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-25T10:00:00Z',
  },
  {
    id: 'd3', customerId: 'c2', title: '东方贸易供应链系统', amount: 180000,
    stage: 'lead', probability: 20, ownerId: 'm2',
    expectedCloseDate: '2026-07-01', notes: '初步需求对接完成', createdBy: 'm2',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-29T10:00:00Z',
  },
  {
    id: 'd4', customerId: 'c3', title: '蓝海制造智能排产', amount: 350000,
    stage: 'lead', probability: 20, ownerId: 'm1',
    expectedCloseDate: '2026-08-01', notes: '技术方案已发送', createdBy: 'm1',
    createdAt: '2026-04-22T10:00:00Z', updatedAt: '2026-04-30T10:00:00Z',
  },
  {
    id: 'd5', customerId: 'c1', title: '伟创科技年度维保', amount: 60000,
    stage: 'won', probability: 100, ownerId: 'm2',
    expectedCloseDate: '2026-04-15', notes: '已签约', createdBy: 'm2',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-15T10:00:00Z',
  },
];

const sampleTasks: Task[] = [
  {
    id: 't1', title: '准备伟创科技方案PPT', description: '包含报价单及实施计划',
    assigneeId: 'm1', relatedType: 'deal', relatedId: 'd1',
    priority: 'high', dueDate: '2026-05-10', completed: false,
    createdBy: 'm1', createdAt: '2026-04-28T10:00:00Z', updatedAt: '2026-04-28T10:00:00Z',
    comments: [
      { id: 'tc1', authorId: 'm2', content: '报价部分我这边协助核对一下', createdAt: '2026-04-28T11:00:00Z' },
    ],
  },
  {
    id: 't2', title: '东方贸易客户拜访', description: '线下见面，进一步了解需求',
    assigneeId: 'm2', relatedType: 'customer', relatedId: 'c2',
    priority: 'medium', dueDate: '2026-05-12', completed: false,
    createdBy: 'm2', createdAt: '2026-04-29T10:00:00Z', updatedAt: '2026-04-29T10:00:00Z',
    comments: [],
  },
  {
    id: 't3', title: '星辰教育合同条款复核', description: '法务确认后发送给客户',
    assigneeId: 'm3', relatedType: 'deal', relatedId: 'd2',
    priority: 'high', dueDate: '2026-05-08', completed: false,
    createdBy: 'm3', createdAt: '2026-04-30T10:00:00Z', updatedAt: '2026-04-30T10:00:00Z',
    comments: [],
  },
  {
    id: 't4', title: '更新客户跟进记录', description: '整理本月新客户的沟通记录',
    assigneeId: 'm4', relatedType: null, relatedId: null,
    priority: 'low', dueDate: '2026-05-15', completed: false,
    createdBy: 'm4', createdAt: '2026-05-01T10:00:00Z', updatedAt: '2026-05-01T10:00:00Z',
    comments: [],
  },
];

const sampleReminders: Reminder[] = [
  {
    id: 'r1', title: '伟创科技方案提交', description: '需在5月10日前提交完整方案',
    relatedType: 'deal', relatedId: 'd1',
    remindAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    triggered: false, createdBy: 'm1', createdAt: new Date().toISOString(),
  },
  {
    id: 'r2', title: '东方贸易客户拜访', description: '5月12日实地拜访',
    relatedType: 'task', relatedId: 't2',
    remindAt: '2026-05-12T09:00:00+08:00',
    triggered: false, createdBy: 'm2', createdAt: new Date().toISOString(),
  },
];

const COLORS = ['#E8602C', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      teamMembers: DEFAULT_MEMBERS,
      customers: sampleCustomers,
      deals: sampleDeals,
      tasks: sampleTasks,
      reminders: sampleReminders,
      dailyTodos: [],

      login: (name: string) => {
        const member = get().teamMembers.find(m => m.name === name);
        if (member) set({ currentUser: member });
      },

      logout: () => set({ currentUser: null }),

      addMember: (m) => set(s => {
        const id = 'm' + genId();
        const usedColors = s.teamMembers.map(m => m.color);
        const availColor = COLORS.find(c => !usedColors.includes(c)) || COLORS[0];
        return { teamMembers: [...s.teamMembers, { ...m, id, color: availColor }] };
      }),

      updateMember: (id, data) => set(s => ({
        teamMembers: s.teamMembers.map(m => m.id === id ? { ...m, ...data } : m),
      })),

      deleteMember: (id) => set(s => ({
        teamMembers: s.teamMembers.filter(m => m.id !== id),
        customers: s.customers.map(c => c.createdBy === id ? { ...c, createdBy: s.teamMembers[0]?.id } : c),
        deals: s.deals.map(d => d.ownerId === id ? { ...d, ownerId: s.teamMembers[0]?.id } : d),
        tasks: s.tasks.map(t => t.assigneeId === id ? { ...t, assigneeId: s.teamMembers[0]?.id } : t),
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
        reminders: [...s.reminders, { ...r, id: 'r' + genId(), createdAt: new Date().toISOString(), triggered: false }],
      })),

      triggerReminder: (id) => set(s => ({
        reminders: s.reminders.map(r => r.id === id ? { ...r, triggered: true } : r),
      })),

      deleteReminder: (id) => set(s => ({
        reminders: s.reminders.filter(r => r.id !== id),
      })),

      getMembers: () => get().teamMembers,
      getCustomerById: (id) => get().customers.find(c => c.id === id),
      getDealById: (id) => get().deals.find(d => d.id === id),

      addDailyTodo: (content) => set(s => {
        const user = s.currentUser;
        if (!user) return s;
        const today = todayStr();
        return {
          dailyTodos: [
            ...s.dailyTodos,
            {
              id: 'dt' + genId(),
              content,
              completed: false,
              date: today,
              createdBy: user.id,
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

      // Keep completed todos from previous days, clear uncompleted ones from today + add new uncompleted from prev uncompleted
      refreshDailyTodos: () => set(s => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().slice(0, 10);
        const today = todayStr();
        // Archive yesterday's uncompleted as uncompleted but mark old, or just keep all completed
        // Strategy: keep all completed todos; clear uncompleted todos that are from before today
        const kept = s.dailyTodos.filter(t => t.completed || t.date === today);
        const fromBefore = s.dailyTodos.filter(t => !t.completed && t.date < today);
        // Carry forward uncompleted ones from before today to today
        const carried = fromBefore.map(t => ({ ...t, id: 'dt' + genId(), date: today }));
        return { dailyTodos: [...kept, ...carried] };
      }),
    }),
    { name: 'teamcrm-store' }
  )
);

export { TEAM_MEMBERS, DEFAULT_MEMBERS };