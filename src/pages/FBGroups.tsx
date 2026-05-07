import { ExternalLink } from 'lucide-react';

const SOURCE = 'https://z1yz6nwj2tcw.space.minimaxi.com/';

export default function FBGroups() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">FB 小组管理</h1>
          <p className="text-gray-400 text-sm mt-0.5">追踪你的 Facebook 群组状态与策略</p>
        </div>
        <a href={SOURCE} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <ExternalLink size={16} />
          新窗口打开
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <ExternalLink size={28} className="text-orange-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">FB 小组管理面板</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            数据源：Judy 提供 · 自行维护更新 · 数据仅保存在本机浏览器
          </p>
          <a href={SOURCE} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
            <ExternalLink size={16} />
            立即打开 FB 小组管理
          </a>
        </div>
      </div>
    </div>
  );
}