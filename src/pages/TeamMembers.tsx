import { useState } from 'react';
import { useCRMStore } from '../store/supabaseStore';
import { Plus, Search, Edit2, Trash2, X, Mail, Shield } from 'lucide-react';
import type { Member } from '../types';

const roleMap: Record<string, string> = {
  '管理员': '管理员',
  '客户经理': '客户经理',
  '商务专员': '商务专员',
  '运营支持': '运营支持',
  '客服专员': '客服专员',
};

function MemberModal({ edit, onClose }: { edit?: Member; onClose: () => void }) {
  const { addMember, updateMember } = useCRMStore();
  const [form, setForm] = useState<Partial<Member>>(edit || {
    name: '', email: '', role: '客户经理', color: '#3B82F6',
  });
  const isEdit = !!edit;

  const colors = ['#E8602C', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    if (isEdit) updateMember(edit.id, form);
    else addMember(form as Omit<Member, 'id'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E1]">
          <h2 className="font-semibold text-[#1A1A1A]">{isEdit ? '编辑成员' : '新增成员'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F8F7F4] rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">姓名</label>
            <input
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="输入成员姓名"
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">邮箱</label>
            <input
              type="email"
              value={form.email || ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="xxx@company.com"
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">角色</label>
            <select
              value={form.role || '客户经理'}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors bg-white"
            >
              {Object.entries(roleMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">头像颜色</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.color === c ? '#1A1A1A' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E8E6E1] rounded-xl py-2.5 text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-colors">取消</button>
            <button type="submit" className="flex-1 bg-[#E8602C] hover:bg-[#D4501F] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors active:scale-[0.97]">
              {isEdit ? '保存修改' : '添加成员'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamMembers() {
  const { currentUser, teamMembers, deleteMember } = useCRMStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | undefined>();

  const filtered = teamMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (id === 'admin') return;
    if (confirm('确定删除该成员？')) deleteMember(id);
  };

  const handleEdit = (m: Member) => {
    setEditMember(m);
    setShowModal(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">团队成员</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{teamMembers.length} 名成员</p>
        </div>
        <button
          onClick={() => { setEditMember(undefined); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#E8602C] hover:bg-[#D4501F] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors active:scale-[0.97]"
        >
          <Plus size={16} />
          新增成员
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索成员姓名或角色..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E6E1] rounded-xl text-sm outline-none focus:border-[#E8602C] transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-2xl p-5 border border-[#E8E6E1] hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[#1A1A1A] text-sm truncate">{m.name}</div>
                  <div className="text-xs text-[#6B6B6B]">{m.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {m.id === 'admin' && <Shield size={14} className="text-[#E8602C]" />}
                <button
                  onClick={() => handleEdit(m)}
                  className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
                >
                  <Edit2 size={14} className="text-[#6B6B6B]" />
                </button>
                {m.id !== 'admin' && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
              <Mail size={12} />
              <span className="truncate">{m.email}</span>
            </div>
            {m.id === currentUser?.id && (
              <div className="mt-2 text-xs text-[#E8602C] font-medium">当前登录</div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#BDBDBD]">
          <p className="text-sm">未找到匹配的成员</p>
        </div>
      )}

      {showModal && <MemberModal edit={editMember} onClose={() => { setShowModal(false); setEditMember(undefined); }} />}
    </div>
  );
}