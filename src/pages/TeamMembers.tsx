import { useState } from 'react';
import { useCRMStore } from '../store/crmStore';
import type { Member } from '../types';

export default function TeamMembers() {
  const { teamMembers, addMember, updateMember, deleteMember, currentUser } = useCRMStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: '', color: '' });

  const isAdmin = currentUser?.role === '管理员' || currentUser?.role === '销售主管';

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addMember({ name: form.name, email: form.email, role: form.role, color: '' });
    setForm({ name: '', email: '', role: '', color: '' });
    setShowForm(false);
  };

  const handleEdit = (m: Member) => {
    setForm({ name: m.name, email: m.email, role: m.role, color: m.color });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !form.name || !form.email) return;
    updateMember(editingId, { name: form.name, email: form.email, role: form.role, color: form.color });
    setForm({ name: '', email: '', role: '', color: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除该成员吗？')) return;
    deleteMember(id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">团队成员</h1>
          <p className="text-gray-400 text-sm mt-1">管理你的团队账号</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', email: '', role: '', color: '' }); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + 新增成员
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? '编辑成员' : '新增成员'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">姓名</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="输入姓名"
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">邮箱</label>
                <input
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="输入邮箱"
                  type="email"
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase mb-1 block">角色</label>
                <input
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder="如：销售、客服、运营"
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                {editingId ? '保存修改' : '确认添加'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <div key={member.id} className="bg-[#1E1E1E] rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{member.name}</h3>
                <p className="text-orange-400 text-xs mt-0.5">{member.role || '成员'}</p>
                <p className="text-gray-500 text-xs mt-1 truncate">{member.email}</p>
              </div>
            </div>
            {currentUser?.id === member.id && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <span className="text-xs text-orange-400 font-medium">当前账号</span>
              </div>
            )}
            {isAdmin && currentUser?.id !== member.id && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 text-xs text-gray-400 hover:text-white border border-gray-600 rounded-lg py-1.5 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg py-1.5 transition-colors"
                >
                  删除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">还没有成员</p>
          <p className="text-sm">点击右上角"新增成员"开始添加</p>
        </div>
      )}
    </div>
  );
}