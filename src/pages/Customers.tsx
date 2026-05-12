import { useState } from 'react';
import { useCRMStore, TEAM_MEMBERS } from '../store/crmStore';
import { Plus, Search, Edit2, Trash2, Phone, Mail, Building, X } from 'lucide-react';
import type { Customer } from '../types';

const statusMap = { new: '新客户', contacted: '已联系', qualified: '已确权', lost: '已流失' };
const statusColor = { new: '#3B82F6', contacted: '#F59E0B', qualified: '#22C55E', lost: '#EF4444' };

function CustomerModal({ edit, onClose }: { edit?: Customer; onClose: () => void }) {
  const { addCustomer, updateCustomer } = useCRMStore();
  const [form, setForm] = useState<Partial<Customer>>(edit || {
    name: '', company: '', phone: '', email: '', industry: '', status: 'new', notes: ''
  });
  const isEdit = !!edit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.company) return;
    if (isEdit) updateCustomer(edit.id, form);
    else addCustomer(form as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E1]">
          <h2 className="font-semibold text-[#1A1A1A]">{isEdit ? '编辑客户' : '新建客户'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F8F7F4] rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { label: '客户名称', key: 'name', placeholder: '输入客户姓名', icon: null },
            { label: '公司名称', key: 'company', placeholder: '输入公司名称', icon: Building },
            { label: '联系电话', key: 'phone', placeholder: '138-xxxx-xxxx', icon: Phone },
            { label: '电子邮箱', key: 'email', placeholder: 'xxx@company.com', icon: Mail },
            { label: '所属行业', key: 'industry', placeholder: '如：科技/贸易/制造', icon: null },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">{f.label}</label>
              <input
                value={(form as any)[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">客户状态</label>
            <select value={form.status || 'new'} onChange={e => setForm({ ...form, status: e.target.value as any })}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors bg-white">
              {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">备注信息</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="记录客户需求、背景等重要信息" rows={3}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E8E6E1] rounded-xl py-2.5 text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-colors">取消</button>
            <button type="submit" className="flex-1 bg-[#E8602C] hover:bg-[#D4501F] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors active:scale-[0.97]">
              {isEdit ? '保存修改' : '创建客户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const { currentUser, customers, deleteCustomer } = useCRMStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.includes(search) || c.company.includes(search) || c.phone.includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleEdit = (c: Customer) => { setEditCustomer(c); setShowModal(true); };
  const handleNew = () => { setEditCustomer(undefined); setShowModal(true); };
  const handleDelete = () => { if (deleteId) { deleteCustomer(deleteId); setDeleteId(null); } };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">客户管理</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">共 {customers.length} 位客户</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 bg-[#E8602C] hover:bg-[#D4501F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97]">
          <Plus size={16} /> 新建客户
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索客户姓名、公司或电话..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E6E1] rounded-xl text-sm outline-none focus:border-[#E8602C] transition-colors" />
        </div>
        <div className="flex gap-2">
          {['all', 'new', 'contacted', 'qualified', 'lost'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E6E1] text-[#6B6B6B] hover:bg-[#F8F7F4]'}`}>
              {s === 'all' ? '全部' : statusMap[s as keyof typeof statusMap]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#F8F7F4] text-xs font-medium text-[#6B6B6B]">
          <div className="col-span-2">客户信息</div>
          <div>行业</div>
          <div>状态</div>
          <div className="text-right">操作</div>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6B6B6B]">暂无客户记录</div>
        ) : filtered.map(c => {
          const creator = TEAM_MEMBERS.find(m => m.id === c.createdBy);
          return (
            <div key={c.id} className="grid grid-cols-5 gap-4 px-5 py-4 items-center border-t border-[#F0EEE9] hover:bg-[#F8F7F4] transition-colors group">
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: creator?.color || '#6B6B6B' }}>
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">{c.name}</div>
                    <div className="text-xs text-[#6B6B6B]">{c.company}</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-[#6B6B6B]">{c.industry || '-'}</div>
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: statusColor[c.status] + '18', color: statusColor[c.status] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor[c.status] }} />
                  {statusMap[c.status]}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-[#F0EEE9] rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-[#6B6B6B] hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <CustomerModal edit={editCustomer} onClose={() => setShowModal(false)} />}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-[#1A1A1A] mb-2">确认删除客户？</h3>
            <p className="text-sm text-[#6B6B6B] mb-5">删除后，关联的交易和任务也会一并清除，此操作不可撤销。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-[#E8E6E1] rounded-xl py-2.5 text-sm text-[#6B6B6B] hover:bg-[#F8F7F4]">取消</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
