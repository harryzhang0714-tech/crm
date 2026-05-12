import { useState } from 'react';
import { useCRMStore, TEAM_MEMBERS } from '../store/crmStore';
import { Plus, MessageSquare, CheckCircle2, Circle, Trash2, Send, X } from 'lucide-react';
import type { Task, TaskPriority } from '../types';

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  high: { label: '高', color: '#EF4444', bg: '#FEF2F2' },
  medium: { label: '中', color: '#F59E0B', bg: '#FFFBEB' },
  low: { label: '低', color: '#22C55E', bg: '#F0FDF4' },
};

function TaskModal({ edit, onClose }: { edit?: Task; onClose: () => void }) {
  const { currentUser, customers, deals, addTask, updateTask } = useCRMStore();
  const [form, setForm] = useState<Partial<Task>>(edit || {
    title: '', description: '', assigneeId: currentUser?.id || '',
    relatedType: null, relatedId: null, priority: 'medium', dueDate: null, completed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    if (edit) updateTask(edit.id, form);
    else addTask(form as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E1]">
          <h2 className="font-semibold text-[#1A1A1A]">{edit ? '编辑任务' : '新建任务'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F8F7F4] rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">任务标题 *</label>
            <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="输入任务名称" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">任务描述</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="详细说明任务内容" rows={3}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">负责人</label>
              <select value={form.assigneeId || ''} onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors bg-white">
                {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">优先级</label>
              <select value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors bg-white">
                <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">截止日期</label>
            <input type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value || null })}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E8E6E1] rounded-xl py-2.5 text-sm text-[#6B6B6B] hover:bg-[#F8F7F4]">取消</button>
            <button type="submit" className="flex-1 bg-[#E8602C] hover:bg-[#D4501F] text-white rounded-xl py-2.5 text-sm font-semibold active:scale-[0.97]">
              {edit ? '保存修改' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentSection({ task }: { task: Task }) {
  const { currentUser, addComment } = useCRMStore();
  const [text, setText] = useState('');
  const members = useCRMStore(s => s.getMembers)();

  const handleSend = () => {
    if (!text.trim()) return;
    addComment(task.id, text.trim());
    setText('');
  };

  return (
    <div className="mt-4 border-t border-[#F0EEE9] pt-4">
      <h4 className="text-xs font-semibold text-[#6B6B6B] mb-3">评论 ({task.comments.length})</h4>
      {task.comments.length === 0 && <p className="text-xs text-[#C0BDB8] mb-3">暂无评论</p>}
      <div className="space-y-3 mb-3">
        {task.comments.map(c => {
          const author = members.find(m => m.id === c.authorId);
          return (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                style={{ backgroundColor: author?.color || '#6B6B6B' }}>
                {author?.name[0]}
              </div>
              <div>
                <div className="text-xs font-medium text-[#1A1A1A]">{author?.name}</div>
                <div className="text-xs text-[#6B6B6B] bg-[#F8F7F4] rounded-lg px-3 py-2 mt-0.5">{c.content}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="添加评论，按回车发送..."
          className="flex-1 border border-[#E8E6E1] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#E8602C] transition-colors" />
        <button onClick={handleSend} className="p-2 bg-[#E8602C] rounded-xl text-white hover:bg-[#D4501F] transition-colors">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { currentUser, tasks, updateTask, deleteTask } = useCRMStore();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filtered = tasks.filter(t => {
    const matchAssignee = filterAssignee === 'all' || t.assigneeId === filterAssignee;
    const matchCompleted = showCompleted || !t.completed;
    return matchAssignee && matchCompleted;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">任务协作</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{tasks.filter(t => !t.completed).length} 项待完成 · {completedCount} 项已完成</p>
        </div>
        <button onClick={() => { setEditTask(undefined); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#E8602C] hover:bg-[#D4501F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97]">
          <Plus size={16} /> 新建任务
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['all', ...TEAM_MEMBERS.map(m => m.id)].map(id => (
          <button key={id} onClick={() => setFilterAssignee(id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterAssignee === id ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E6E1] text-[#6B6B6B] hover:bg-[#F8F7F4]'}`}>
            {id === 'all' ? '全部成员' : TEAM_MEMBERS.find(m => m.id === id)?.name}
          </button>
        ))}
        <button onClick={() => setShowCompleted(!showCompleted)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${showCompleted ? 'bg-[#22C55E] text-white' : 'bg-white border border-[#E8E6E1] text-[#6B6B6B] hover:bg-[#F8F7F4]'}`}>
          {showCompleted ? '✓ 已显示完成' : '显示已完成'}
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-[#6B6B6B]">暂无任务</div>
        )}
        {filtered.map(task => {
          const assignee = TEAM_MEMBERS.find(m => m.id === task.assigneeId);
          const pcfg = priorityConfig[task.priority];
          const isExpanded = expandedTask === task.id;

          return (
            <div key={task.id} className={`bg-white rounded-2xl border transition-all ${task.completed ? 'border-[#E8E6E1] opacity-70' : 'border-[#E8E6E1] hover:shadow-md'}`}>
              <div className="flex items-start gap-3 p-4">
                <button onClick={() => updateTask(task.id, { completed: !task.completed })}
                  className="mt-0.5 flex-shrink-0 text-[#6B6B6B] hover:text-[#22C55E] transition-colors">
                  {task.completed ? <CheckCircle2 size={20} className="text-[#22C55E]" /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                  <div className={`text-sm font-medium cursor-pointer ${task.completed ? 'line-through text-[#6B6B6B]' : 'text-[#1A1A1A]'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: pcfg.bg, color: pcfg.color }}>
                      {pcfg.label}优先级
                    </span>
                    {assignee && (
                      <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                          style={{ backgroundColor: assignee.color }}>{assignee.name[0]}</div>
                        {assignee.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-[#6B6B6B]">📅 {task.dueDate}</span>
                    )}
                    {task.comments.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                        <MessageSquare size={12} /> {task.comments.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => { setEditTask(task); setShowModal(true); }}
                    className="p-1.5 hover:bg-[#F8F7F4] rounded-lg text-[#6B6B6B] text-xs">编辑</button>
                  <button onClick={() => deleteTask(task.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-[#6B6B6B] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4">
                  {task.description && (
                    <div className="text-xs text-[#6B6B6B] mb-3 pl-8">{task.description}</div>
                  )}
                  <CommentSection task={task} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && <TaskModal edit={editTask} onClose={() => setShowModal(false)} />}
    </div>
  );
}
