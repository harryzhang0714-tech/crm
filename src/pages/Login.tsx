import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore } from '../store/crmStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useCRMStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    login('admin');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#E8602C] flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-orange-500/30">
            C
          </div>
          <h1 className="text-white text-2xl font-bold">TeamCRM</h1>
          <p className="text-white/40 text-sm mt-1">客户管理系统</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="bg-[#2C2C2E] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-medium mb-2 block">系统账号</label>
            <div className="w-full bg-[#1C1C1E] text-white/50 rounded-xl px-4 py-3 text-sm border border-white/10 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#E8602C] flex items-center justify-center text-white text-[10px] font-bold">A</div>
              <span>admin</span>
              <span className="ml-auto text-white/20 text-xs">管理员</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8602C] hover:bg-[#D4501F] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors active:scale-[0.97]"
          >
            {loading ? '进入中...' : '进入系统'}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-6">
          演示系统 · 数据存储在本地浏览器
        </p>
      </div>
    </div>
  );
}