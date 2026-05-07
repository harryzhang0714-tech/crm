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
      // New day: carry forward all incomplete todos from lastDate to today
      useCRMStore.setState(s => {
        const updated = s.dailyTodos.map(t => {
          if (!t.completed && t.date === lastDate) {
            return { ...t, id: 'dt' + Math.random().toString(36).slice(2, 10), date: today };
          }
          return t;
        });
        return { dailyTodos: updated };
      });
    }
    localStorage.setItem('teamcrm-todo-date', today);
    setInitialized(true);
  }, [today]);

  const todayTodos = dailyTodos.filter(t => t.date === today);
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
          placeholder="输入待办事项，按回车添加..."
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

      {/* Yesterday incomplete hint */}
      {todayTodos.length === 0 && dailyTodos.filter(t => !t.completed && t.date < today).length > 0 && (
        <div className="mt-4 text-center text-xs text-gray-600">
          有 {dailyTodos.filter(t => !t.completed && t.date < today).length} 条昨日未完成任务已自动延期到今天
        </div>
      )}
    </div>
  );
}