import { useState, useEffect } from 'react';
import { useCRMStore, TEAM_MEMBERS } from '../store/crmStore';
import { Plus, Bell, BellOff, Trash2, X, Clock } from 'lucide-react';
import type { Reminder } from '../types';

function ReminderModal({ edit, onClose }: { edit?: Reminder; onClose: () => void }) {
  const { currentUser, addReminder, triggerReminder } = useCRMStore();
  const [form, setForm] = useState({
    title: edit?.title || '',
    description: edit?.description || '',
    remindAt: edit?.remindAt ? new Date(edit.remindAt).toISOString().slice(0, 16) : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.remindAt) return;
    addReminder({
      title: form.title,
      description: form.description,
      relatedType: null,
      relatedId: null,
      remindAt: new Date(form.remindAt).toISOString(),
      createdBy: currentUser?.id || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E1]">
          <h2 className="font-semibold text-[#1A1A1A]">设置跟进提醒</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F8F7F4] rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">提醒标题 *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="如：联系客户确认报价"
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">提醒时间 *</label>
            <input type="datetime-local" value={form.remindAt} onChange={e => setForm({ ...form, remindAt: e.target.value })}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">备注说明</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="补充说明或其他细节" rows={3}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E8E6E1] rounded-xl py-2.5 text-sm text-[#6B6B6B] hover:bg-[#F8F7F4]">取消</button>
            <button type="submit" className="flex-1 bg-[#E8602C] hover:bg-[#D4501F] text-white rounded-xl py-2.5 text-sm font-semibold active:scale-[0.97]">
              设置提醒
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Reminders() {
  const { currentUser, reminders, triggerReminder, deleteReminder } = useCRMStore();
  const [showModal, setShowModal] = useState(false);
  const [showTriggered, setShowTriggered] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermissionGranted(result === 'granted');
    }
  };

  // Check reminders every 30 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach(r => {
        if (!r.triggered && new Date(r.remindAt) <= now) {
          triggerReminder(r.id);
          if (Notification.permission === 'granted') {
            new Notification('🔔 ' + r.title, {
              body: r.description || '您有一个跟进提醒',
              icon: '/favicon.ico',
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    checkReminders(); // Run immediately
    return () => clearInterval(interval);
  }, [reminders, triggerReminder]);

  const activeReminders = reminders.filter(r => !r.triggered);
  const triggeredReminders = reminders.filter(r => r.triggered);
  const displayReminders = showTriggered ? triggeredReminders : activeReminders;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    if (diff < 0) return '已过期';
    if (diff < 60000) return '即将到来';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟后`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时后`;
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">跟进提醒</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{activeReminders.length} 个待触发 · {triggeredReminders.length} 个已触发</p>
        </div>
        <div className="flex items-center gap-3">
          {!permissionGranted && (
            <button onClick={requestPermission}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium active:scale-[0.97]">
              <Bell size={16} /> 开启通知
            </button>
          )}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#E8602C] hover:bg-[#D4501F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97]">
            <Plus size={16} /> 设置提醒
          </button>
        </div>
      </div>

      {/* Permission notice */}
      {!permissionGranted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Bell size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-amber-800">启用浏览器通知</div>
            <div className="text-xs text-amber-600 mt-0.5">点击"开启通知"按钮，以便在提醒时间到达时收到浏览器通知</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setShowTriggered(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!showTriggered ? 'bg-[#E8602C] text-white' : 'bg-white border border-[#E8E6E1] text-[#6B6B6B] hover:bg-[#F8F7F4]'}`}>
          <span className="flex items-center gap-2"><Bell size={14} /> 待触发 ({activeReminders.length})</span>
        </button>
        <button onClick={() => setShowTriggered(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showTriggered ? 'bg-[#E8602C] text-white' : 'bg-white border border-[#E8E6E1] text-[#6B6B6B] hover:bg-[#F8F7F4]'}`}>
          <span className="flex items-center gap-2"><BellOff size={14} /> 已触发 ({triggeredReminders.length})</span>
        </button>
      </div>

      {/* Reminder list */}
      {displayReminders.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={32} className="mx-auto mb-3 text-[#E8E6E1]" />
          <p className="text-sm text-[#6B6B6B]">{showTriggered ? '暂无已触发的提醒' : '暂无待触发的提醒'}</p>
          {!showTriggered && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-[#E8602C] text-sm font-medium hover:underline">
              设置第一个提醒
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayReminders.map(r => {
            const creator = TEAM_MEMBERS.find(m => m.id === r.createdBy);
            return (
              <div key={r.id} className={`bg-white rounded-2xl p-4 border transition-all ${r.triggered ? 'border-[#E8E6E1] opacity-60' : 'border-[#E8E6E1] hover:shadow-md'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.triggered ? 'bg-[#F0EEE9]' : 'bg-orange-100'}`}>
                    {r.triggered
                      ? <BellOff size={18} className="text-[#6B6B6B]" />
                      : <Bell size={18} className="text-[#E8602C]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1A1A1A]">{r.title}</div>
                    {r.description && <div className="text-xs text-[#6B6B6B] mt-1">{r.description}</div>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#6B6B6B] flex items-center gap-1">
                        <Clock size={11} /> {formatTime(r.remindAt)}
                      </span>
                      {creator && (
                        <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                            style={{ backgroundColor: creator.color }}>{creator.name[0]}</div>
                          {creator.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(r.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-[#6B6B6B] hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <ReminderModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
