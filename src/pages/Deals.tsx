import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCRMStore, TEAM_MEMBERS } from '../store/crmStore';
import { Plus, X, Search } from 'lucide-react';
import type { Deal, DealStage } from '../types';

const stages: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: '潜在客户', color: '#6B6B6B' },
  { key: 'qualified', label: '需求确认', color: '#3B82F6' },
  { key: 'proposal', label: '报价中', color: '#F59E0B' },
  { key: 'won', label: '已成交', color: '#22C55E' },
  { key: 'lost', label: '已失败', color: '#EF4444' },
];

function DealModal({ edit, onClose }: { edit?: Deal; onClose: () => void }) {
  const { currentUser, customers, addDeal, updateDeal } = useCRMStore();
  const [form, setForm] = useState<Partial<Deal>>(edit || {
    customerId: '', title: '', amount: 0, stage: 'lead', probability: 20, ownerId: currentUser?.id || '',
    expectedCloseDate: '', notes: ''
  });
  const [custSearch, setCustSearch] = useState('');
  const [showCustList, setShowCustList] = useState(false);
  const custRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (custRef.current && !custRef.current.contains(e.target as Node)) setShowCustList(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = customers.filter(c =>
    !custSearch || c.name.includes(custSearch) || c.company.includes(custSearch)
  );

  const handleCustSelect = (cid: string) => {
    setForm(f => ({ ...f, customerId: cid }));
    setCustSearch('');
    setShowCustList(false);
  };

  const selectedCust = customers.find(c => c.id === form.customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.customerId) return;
    if (edit) updateDeal(edit.id, form);
    else addDeal(form as Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E1] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#1A1A1A]">{edit ? '编辑交易' : '新建交易'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F8F7F4] rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">交易标题</label>
            <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="如：伟创科技ERP项目" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">关联客户</label>
            <div ref={custRef} className="relative">
              <div
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm min-h-[42px] flex items-center cursor-pointer bg-white"
                onClick={() => setShowCustList(v => !v)}
              >
                {selectedCust
                  ? <span className="truncate">{selectedCust.name} · {selectedCust.company}</span>
                  : <span className="text-[#aaa]">搜索或选择客户...</span>
                }
              </div>
              {showCustList && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-[#E8E6E1] shadow-lg max-h-52 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-[#F0EEE9] px-3 py-2">
                    <div className="flex items-center gap-2 bg-[#F8F7F4] rounded-lg px-3 py-2">
                      <Search size={14} className="text-[#aaa] flex-shrink-0" />
                      <input
                        autoFocus
                        value={custSearch}
                        onChange={e => setCustSearch(e.target.value)}
                        placeholder="搜索客户名称或公司..."
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  {filtered.length === 0 && (
                    <div className="text-center py-4 text-xs text-[#aaa]">未找到匹配的客户</div>
                  )}
                  {filtered.map(c => (
                    <div key={c.id}
                      onClick={() => handleCustSelect(c.id)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F7F4] cursor-pointer border-b border-[#F8F7F4] last:border-0">
                      <div className="w-7 h-7 rounded-full bg-[#E8602C]/10 text-[#E8602C] text-xs flex items-center justify-center font-semibold flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1A1A1A]">{c.name}</div>
                        <div className="text-xs text-[#6B6B6B]">{c.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">交易金额（元）</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="500000" className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">负责人</label>
              <select value={form.ownerId || ''} onChange={e => setForm({ ...form, ownerId: e.target.value })}
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors bg-white">
                <option value="">选择成员</option>
                {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">交易阶段</label>
              <select value={form.stage || 'lead'} onChange={e => setForm({ ...form, stage: e.target.value as DealStage })}
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors bg-white">
                {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">预计成交日期</label>
              <input type="date" value={form.expectedCloseDate || ''} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })}
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1.5 block">备注</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="交易相关备注" rows={3}
              className="w-full border border-[#E8E6E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E8602C] transition-colors resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E8E6E1] rounded-xl py-2.5 text-sm text-[#6B6B6B] hover:bg-[#F8F7F4]">取消</button>
            <button type="submit" className="flex-1 bg-[#E8602C] hover:bg-[#D4501F] text-white rounded-xl py-2.5 text-sm font-semibold active:scale-[0.97]">
              {edit ? '保存修改' : '创建交易'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Deals() {
  const { deals, customers, updateDeal, deleteDeal } = useCRMStore();
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | undefined>();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStage = destination.droppableId as DealStage;
    updateDeal(draggableId, { stage: newStage });
  };

  const totalAmount = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.amount, 0);

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">交易看板</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">总金额 ¥{totalAmount.toLocaleString()} · {deals.filter(d => !['won', 'lost'].includes(d.stage)).length} 个进行中</p>
        </div>
        <button onClick={() => { setEditDeal(undefined); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#E8602C] hover:bg-[#D4501F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97]">
          <Plus size={16} /> 新建交易
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            const stageTotal = stageDeals.reduce((s, d) => s + d.amount, 0);
            return (
              <div key={stage.key} className="flex-shrink-0 w-[260px] flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-semibold text-[#1A1A1A]">{stage.label}</span>
                    <span className="text-xs text-[#6B6B6B] bg-[#F0EEE9] px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                  </div>
                  <span className="text-xs text-[#6B6B6B]">¥{(stageTotal / 10000).toFixed(0)}万</span>
                </div>
                <Droppable droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`flex-1 rounded-xl p-2 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#F0EEE9]' : 'bg-[#F8F7F4]'}`}>
                      {stageDeals.map((deal, idx) => {
                        const customer = customers.find(c => c.id === deal.customerId);
                        const owner = TEAM_MEMBERS.find(m => m.id === deal.ownerId);
                        return (
                          <Draggable key={deal.id} draggableId={deal.id} index={idx}>
                            {(prov, snap) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                onClick={() => { setEditDeal(deal); setShowModal(true); }}
                                className={`bg-white rounded-xl p-3 mb-2 border border-[#E8E6E1] cursor-pointer transition-all hover:shadow-md ${snap.isDragging ? 'shadow-lg rotate-2' : ''}`}>
                                <div className="text-sm font-semibold text-[#1A1A1A] mb-1 truncate">{deal.title}</div>
                                <div className="text-xs text-[#6B6B6B] mb-2">{customer?.company}</div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-[#E8602C]">¥{(deal.amount / 10000).toFixed(0)}万</span>
                                  {owner && (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                      style={{ backgroundColor: owner.color }} title={owner.name}>
                                      {owner.name[0]}
                                    </div>
                                  )}
                                </div>
                                {deal.expectedCloseDate && (
                                  <div className="text-[10px] text-[#6B6B6B] mt-1.5">预计 {deal.expectedCloseDate}</div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showModal && <DealModal edit={editDeal} onClose={() => setShowModal(false)} />}
    </div>
  );
}
