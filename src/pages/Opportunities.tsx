import { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

const OPPORTUNITY_SOURCE = 'https://dashboard01-five.vercel.app/';

export default function Opportunities() {
  const [key, setKey] = useState(0);

  const handleRefresh = () => setKey(k => k + 1);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">商机看板</h1>
          <p className="text-gray-400 text-sm mt-0.5">Facebook 群组采购/代发商机实时追踪</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={OPPORTUNITY_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            新窗口打开
          </a>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw size={13} />
            刷新
          </button>
        </div>
      </div>

      {/* Embedded iframe */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-800 bg-white">
        <iframe
          key={key}
          src={OPPORTUNITY_SOURCE}
          title="商机看板"
          className="w-full h-full"
          style={{ border: 'none' }}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}