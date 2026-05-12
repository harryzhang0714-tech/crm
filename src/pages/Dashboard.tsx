import { useCRMStore, TEAM_MEMBERS } from '../store/crmStore';
import { useNavigate } from 'react-router-dom';
import { Users, Handshake, CheckSquare, Bell, TrendingUp, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function StatCard({ icon: Icon, value, label, color, onClick }: {
  icon: LucideIcon; value: string | number; label: string; color: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="bg-white rounded-2xl p-5 flex items-start gap-4 w-full text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 border border-[#E8E6E1] group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
        <div className="text-sm text-[#6B6B6B] mt-0.5">{label}</div>
      </div>
      <ArrowRight size={16} className="ml-auto text-[#E8E6E1] group-hover:text-[#E8602C] transition-colors self-center" />
    </button>
  );
}

export default function Dashboard() {
  const { currentUser, customers, deals, tasks, reminders } = useCRMStore();
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];

  const stats = {
    customers: customers.length,
    activeDeals: deals.filter((d: any) => !['won', 'lost'].includes(d.stage)).length,
    dealAmount: deals.filter((d: any) => d.stage !== 'lost').reduce((s: number, d: any) => s + d.amount, 0),
    pendingTasks: tasks.filter((t: any) => !t.completed).length,
    upcomingReminders: reminders.filter((r: any) => !r.triggered && r.remindAt.split('T')[0] >= todayStr).length,
  };

  const myTasks = tasks.filter((t: any) => t.assigneeId === currentUser?.id && !t.completed).slice(0, 4);
  const recentDeals = deals.filter((d: any) => !['won', 'lost'].includes(d.stage)).slice(0, 4);
  const urgentReminders = reminders.filter((r: any) => !r.triggered).slice(0, 3);

  const dealStageColor: Record<string, string> = { lead: '#6B6B6B', qualified: '#3B82F6', proposal: '#F59E0B', won: '#22C55E', lost: '#EF4444' };
  const dealStageLabel: Record<string, string> = { lead: '潜在', qualified: '需求确认', proposal: '报价中', won: '已成交', lost: '已失败' };
  const priorityColor: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return '上午好';
    if (h < 18) return '下午好';
    return '晚上好';
  })();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{greeting}，{currentUser?.name} 👋</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">欢迎回来，看看今天的工作吧</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Users} value={stats.customers} label="客户总数" color="#3B82F6" onClick={() => navigate('/customers')} />
        <StatCard icon={Handshake} value={stats.activeDeals} label="进行中交易" color="#E8602C" onClick={() => navigate('/deals')} />
        <StatCard icon={CheckSquare} value={stats.pendingTasks} label="待完成任务" color="#F59E0B" onClick={() => navigate('/tasks')} />
        <StatCard icon={Bell} value={stats.upcomingReminders} label="待触发提醒" color="#22C55E" onClick={() => navigate('/reminders')} />
      </div>

      <div className="bg-gradient-to-r from-[#E8602C] to-[#F59E0B] rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div>
          <div className="text-white/80 text-sm font-medium">当前活跃交易总额</div>
          <div className="text-white text-2xl font-bold mt-1">¥{stats.dealAmount.toLocaleString()}</div>
        </div>
        <TrendingUp size={32} className="text-white/30" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My tasks */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E6E1]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A1A1A]">我的任务</h2>
            <button onClick={() => navigate('/tasks')} className="text-[#E8602C] text-xs font-medium hover:underline">查看全部</button>
          </div>
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-[#6B6B6B] text-sm">
              <CheckSquare size={24} className="mx-auto mb-2 text-[#E8E6E1]" />
              暂无分配给我的任务
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.map((task: any) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F7F4] hover:bg-[#F0EEE9] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: priorityColor[task.priority] }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#1A1A1A] truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {task.dueDate && <span className="text-xs text-[#6B6B6B] flex items-center gap-1"><Clock size={10} /> {task.dueDate}</span>}
                      {task.comments.length > 0 && <span className="text-xs text-[#6B6B6B]">💬 {task.comments.length}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active deals */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E6E1]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A1A1A]">进行中交易</h2>
            <button onClick={() => navigate('/deals')} className="text-[#E8602C] text-xs font-medium hover:underline">查看全部</button>
          </div>
          {recentDeals.length === 0 ? (
            <div className="text-center py-8 text-[#6B6B6B] text-sm">
              <Handshake size={24} className="mx-auto mb-2 text-[#E8E6E1]" />
              暂无进行中的交易
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeals.map((deal: any) => {
                const owner = TEAM_MEMBERS.find((m: any) => m.id === deal.ownerId);
                const customer = customers.find((c: any) => c.id === deal.customerId);
                return (
                  <div key={deal.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F7F4] hover:bg-[#F0EEE9] transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: owner?.color || '#6B6B6B' }}>{owner?.name[0]}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#1A1A1A] truncate">{deal.title}</div>
                      <div className="text-xs text-[#6B6B6B]">{customer?.company}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-[#1A1A1A]">¥{(deal.amount / 10000).toFixed(0)}万</div>
                      <div className="text-[10px]" style={{ color: dealStageColor[deal.stage] }}>{dealStageLabel[deal.stage]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {urgentReminders.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-5 border border-[#E8E6E1]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-[#E8602C]" />
            <h2 className="font-semibold text-[#1A1A1A]">待处理提醒</h2>
          </div>
          <div className="space-y-2">
            {urgentReminders.map((reminder: any) => {
              const member = TEAM_MEMBERS.find((m: any) => m.id === reminder.createdBy);
              return (
                <div key={reminder.id} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <Bell size={14} className="text-[#E8602C] flex-shrink-0" />
                  <span className="text-[#1A1A1A] flex-1">{reminder.title}</span>
                  <span className="text-xs text-[#6B6B6B]">
                    {new Date(reminder.remindAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: member?.color || '#6B6B6B' }}>{member?.name[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}