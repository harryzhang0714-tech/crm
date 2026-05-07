import { useState, useEffect, useRef } from 'react';
import { useCRMStore } from '../store/crmStore';
import { CheckCircle, Circle, Trash2, Plus, Sun } from 'lucide-react';

export default function DailyTodos() {
  const { dailyTodos, addDailyTodo, toggleDailyTodo, deleteDailyTodo, currentUser } = useCRMStore();
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const initRef = useRef(false);

  // Auto-carry forward yesterday's incomplete todos to today — runs once on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const lastDate = localStorage.getItem('teamcrm-todo-date');
    if (lastDate && lastDate !== today) {
      useCRMStore.setState(s => {
        const uid = s.currentUser?.id;
        const updated = s.dailyTodos.map(t => {
          if (!t.completed && t.date === lastDate) {
            return { ...t, id: 'dt' + Math.random().toString(36).slice(2, 10), date: today, createdBy: uid || t.createdBy };
          }
          return t;
        });
        return { dailyTodos: updated };
      });
    }
    localStorage.setItem('teamcrm-todo-date', today);
    setInitialized(true);
  }, [today]);

  // Filter: show only current user's todos for today, plus others' today todos from this session
  const todayTodos = dailyTodos.filter(t => t.date === today && t.createdBy === currentUser?.id);
  const othersTodos = dailyTodos.filter(t => t.date === today && t.createdBy !== currentUser?.id);
  const completed = todayTodos.filter(t => t.completed).length;
  const total = todayTodos.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAdd = () => {
    if (!input.trim()) return;
    addDailyTodo(input.trim());
    localStorage.setItem('teamcrm-todo-date', today);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
          <Sun size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">每日待办</h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{completed}/{total} 已完成</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`添加 ${currentUser?.name || '你的'} 的今日待办...`}
          className="flex-1 bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 outline-none placeholder-gray-500"
        />
        <button
          onClick={handleAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          添加
        </button>
      </div>

      {/* Empty state */}
      {todayTodos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">☀️</div>
          <p className="text-sm">今天还没有待办</p>
          <p className="text-xs mt-1">开始添加今天的任务吧！</p>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-2">
        {todayTodos.map(todo => (
          <div
            key={todo.id}
            className={`group flex items-center gap-3 bg-[#1E1E1E] rounded-xl px-4 py-3 border transition-all ${
              todo.completed ? 'border-green-900/30 opacity-70' : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            <button onClick={() => toggleDailyTodo(todo.id)} className="flex-shrink-0">
              {todo.completed
                ? <CheckCircle size={20} className="text-green-400" />
                : <Circle size={20} className="text-gray-500 hover:text-orange-400 transition-colors" />
              }
            </button>
            <span className={`flex-1 text-sm transition-all ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {todo.content}
            </span>
            <button
              onClick={() => deleteDailyTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Others' todos */}
      {othersTodos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">其他成员今日待办</h3>
          <div className="space-y-2">
            {othersTodos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 bg-[#1E1E1E]/50 rounded-xl px-4 py-3 border border-gray-800/50 opacity-60">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] flex-shrink-0">
                  {dailyTodos.find(t => t.id === todo.id)?.createdBy?.[1] || '?'}
                </div>
                <span className="flex-1 text-sm text-gray-400 truncate">{todo.content}</span>
                {todo.completed && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}