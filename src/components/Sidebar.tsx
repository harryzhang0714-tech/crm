import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Handshake, CheckSquare, Bell, LogOut, Menu, X, UserPlus, CalendarCheck, TrendingUp, UsersRound, Image
} from 'lucide-react';
import { useState } from 'react';
import { useCRMStore } from '../store/crmStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/customers', icon: Users, label: '客户管理' },
  { to: '/deals', icon: Handshake, label: '交易跟进' },
  { to: '/tasks', icon: CheckSquare, label: '任务协作' },
  { to: '/daily', icon: CalendarCheck, label: '每日待办' },
  { to: '/opportunities', icon: TrendingUp, label: '商机看板' },
  { to: '/fbgroups', icon: UsersRound, label: 'FB小组管理' },
  { to: '/gallery', icon: Image, label: '素材库' },
  { to: '/reminders', icon: Bell, label: '跟进提醒' },
  { to: '/team', icon: UserPlus, label: '团队成员' },
];

export default function Sidebar() {
  const { currentUser, logout } = useCRMStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8602C] flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="text-white font-semibold text-sm tracking-wide">TeamCRM</span>
        </div>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 relative group ${
                isActive
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E8602C] rounded-r-full" />
                )}
                <Icon size={18} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        {currentUser && (
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{currentUser.name}</div>
              <div className="text-white/40 text-[10px] truncate">{currentUser.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors w-full"
        >
          <LogOut size={14} />
          退出登录
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1C1C1E] rounded-lg text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-[#1C1C1E] h-screen sticky top-0 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-[220px] bg-[#1C1C1E] h-full">
            <NavContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}