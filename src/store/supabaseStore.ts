import { create } from 'zustand';
import { supabase, TABLES } from '../lib/supabase';
import type { Member, Customer, Deal, Task, Reminder, DailyTodo } from '../types';

const genId = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);

interface CRMStore {
  currentUser: Member | null;
  teamMembers: Member[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  reminders: Reminder[];
  dailyTodos: DailyTodo[];
  initialized: boolean;
  loading: boolean;
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
  addDailyTodo: (content: string) => void;
  toggleDailyTodo: (id: string) => void;
  deleteDailyTodo: (id: string) => void;
  refreshDailyTodos: () => void;
  initFromSupabase: () => Promise<void>;
}

export const useCRMStore = create<CRMStore>()((set, get) => ({
  currentUser: null,
  teamMembers: [],
  customers: [],
  deals: [],
  tasks: [],
  reminders: [],
  dailyTodos: [],
  initialized: false,
  loading: true,

  initFromSupabase: async () => {
    const [members, customers, deals, tasks, reminders, dailyTodos] = await Promise.all([
      supabase.from(TABLES.MEMBERS).select('*').then(r => r.data || []),
      supabase.from(TABLES.CUSTOMERS).select('*').then(r => r.data || []),
      supabase.from(TABLES.DEALS).select('*').then(r => r.data || []),
      supabase.from(TABLES.TASKS).select('*').then(r => r.data || []),
      supabase.from(TABLES.REMINDERS).select('*').then(r => r.data || []),
      supabase.from(TABLES.DAILY_TODOS).select('*').then(r => r.data || []),
    ]);
    set({ teamMembers: members as Member[], customers: customers as Customer[], deals: deals as Deal[], tasks: tasks as Task[], reminders: reminders as Reminder[], dailyTodos: dailyTodos as DailyTodo[], initialized: true, loading: false });
  },

  login: (name: string) => {
    const member = get().teamMembers.find(m => m.name === name);
    if (member) { set({ currentUser: member }); }
  },

  logout: () => set({ currentUser: null }),

  updateMember: async (id, data) => {
    set(s => ({ teamMembers: s.teamMembers.map(m => m.id === id ? { ...m, ...data } : m), currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...data } : s.currentUser }));
    await supabase.from(TABLES.MEMBERS).update(data).eq('id', id);
  },

  addMember: async (m) => {
    const { data } = await supabase.from(TABLES.MEMBERS).insert(m).select().single();
    if (data) set(s => ({ teamMembers: [...s.teamMembers, data as Member] }));
  },

  deleteMember: async (id) => {
    set(s => ({ teamMembers: s.teamMembers.filter(m => m.id !== id), currentUser: s.currentUser?.id === id ? null : s.currentUser }));
    await supabase.from(TABLES.MEMBERS).delete().eq('id', id);
  },

  addCustomer: async (c) => {
    const { data } = await supabase.from(TABLES.CUSTOMERS).insert({ ...c }).select().single();
    if (data) set(s => ({ customers: [...s.customers, data as Customer] }));
  },

  updateCustomer: async (id, data) => {
    set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c) }));
    await supabase.from(TABLES.CUSTOMERS).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  },

  deleteCustomer: async (id) => {
    set(s => ({ customers: s.customers.filter(c => c.id !== id), deals: s.deals.filter(d => d.customerId !== id) }));
    await supabase.from(TABLES.CUSTOMERS).delete().eq('id', id);
  },

  addDeal: async (d) => {
    const { data } = await supabase.from(TABLES.DEALS).insert(d).select().single();
    if (data) set(s => ({ deals: [...s.deals, data as Deal] }));
  },

  updateDeal: async (id, data) => {
    set(s => ({ deals: s.deals.map(d => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d) }));
    await supabase.from(TABLES.DEALS).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  },

  deleteDeal: async (id) => {
    set(s => ({ deals: s.deals.filter(d => d.id !== id) }));
    await supabase.from(TABLES.DEALS).delete().eq('id', id);
  },

  addTask: async (t) => {
    const { data } = await supabase.from(TABLES.TASKS).insert({ ...t, comments: [] }).select().single();
    if (data) set(s => ({ tasks: [...s.tasks, data as Task] }));
  },

  updateTask: async (id, data) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t) }));
    await supabase.from(TABLES.TASKS).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  },

  deleteTask: async (id) => {
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
    await supabase.from(TABLES.TASKS).delete().eq('id', id);
  },

  addComment: async (taskId, content) => {
    const user = get().currentUser;
    if (!user) return;
    const comment = { id: 'cm' + genId(), authorId: user.id, content, createdAt: new Date().toISOString() };
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment], updatedAt: new Date().toISOString() } : t) }));
    await get().updateTask(taskId, { comments: get().tasks.find(t => t.id === taskId)?.comments });
  },

  addReminder: async (r) => {
    const { data } = await supabase.from(TABLES.REMINDERS).insert(r).select().single();
    if (data) set(s => ({ reminders: [...s.reminders, data as Reminder] }));
  },

  triggerReminder: async (id) => {
    set(s => ({ reminders: s.reminders.map(r => r.id === id ? { ...r, triggered: true } : r) }));
    await supabase.from(TABLES.REMINDERS).update({ triggered: true }).eq('id', id);
  },

  deleteReminder: async (id) => {
    set(s => ({ reminders: s.reminders.filter(r => r.id !== id) }));
    await supabase.from(TABLES.REMINDERS).delete().eq('id', id);
  },

  addDailyTodo: async (content) => {
    const user = get().currentUser;
    const { data } = await supabase.from(TABLES.DAILY_TODOS).insert({ content, completed: false, date: todayStr(), created_by: user?.id }).select().single();
    if (data) set(s => ({ dailyTodos: [...s.dailyTodos, data as DailyTodo] }));
  },

  toggleDailyTodo: async (id) => {
    const todo = get().dailyTodos.find(t => t.id === id);
    if (!todo) return;
    set(s => ({ dailyTodos: s.dailyTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
    await supabase.from(TABLES.DAILY_TODOS).update({ completed: !todo.completed }).eq('id', id);
  },

  deleteDailyTodo: async (id) => {
    set(s => ({ dailyTodos: s.dailyTodos.filter(t => t.id !== id) }));
    await supabase.from(TABLES.DAILY_TODOS).delete().eq('id', id);
  },

  refreshDailyTodos: async () => {
    const { dailyTodos } = get();
    const today = todayStr();
    const kept = dailyTodos.filter(t => t.completed || t.date === today);
    const fromBefore = dailyTodos.filter(t => !t.completed && t.date < today);
    const carried = fromBefore.map(t => ({ ...t, id: 'dt' + genId(), date: today }));
    set({ dailyTodos: [...kept, ...carried] });
  },
}));