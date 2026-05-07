import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore, TEAM_MEMBERS } from '../store/crmStore';
import { Users } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useCRMStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const member = TEAM_MEMBERS.find(m => m.name === name.trim());
    if (member) {
      login(member.name);
      navigate('/dashboard');
    } else {
      setError('未找到该成员，请输入正确的姓名');
    }
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
          <p className="text-white/40 text-sm mt-1">团队协作客户管理系统</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="bg-[#2C2C2E] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-medium mb-2 block">输入你的名字登录</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="例如：张明"
              className="w-full bg-[#1C1C1E] text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-[#E8602C] transition-colors"
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#E8602C] hover:bg-[#D4501F] text-white font-semibold py-3 rounded-xl text-sm transition-colors active:scale-[0.97]"
          >
            进入系统
          </button>
        </form>

        {/* Team members */}
        <div className="mt-6">
          <p className="text-white/30 text-xs text-center mb-3">或选择团队成员</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TEAM_MEMBERS.map(m => (
              <button
                key={m.id}
                onClick={() => { setName(m.name); }}
                className="flex items-center gap-2 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white/70 hover:text-white px-3 py-1.5 rounded-full text-xs transition-all"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name[0]}
                </div>
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">
          演示系统 · 数据存储在本地浏览器
        </p>
      </div>
    </div>
  );
}