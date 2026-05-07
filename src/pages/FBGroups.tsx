import { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

const SOURCE = 'https://z1yz6nwj2tcw.space.minimaxi.com/';

export default function FBGroups() {
  const [key, setKey] = useState(0);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">FB 小组管理</h1>
          <p className="text-gray-400 text-sm mt-0.5">追踪你的 Facebook 群组状态与策略</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={SOURCE} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
            <ExternalLink size={13} />新窗口打开
          </a>
          <button onClick={() => setKey(k => k + 1)}
            className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw size={13} />刷新
          </button>
        </div>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-800 bg-white">
        <iframe key={key} src={SOURCE} title="FB小组管理" className="w-full h-full" style={{ border: 'none' }} />
      </div>
    </div>
  );
}