import React from 'react';
import { Clock, CheckCircle2, ArrowRightCircle, Sparkles, User } from 'lucide-react';

export default function ComplaintHistoryTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm italic">
        No status history recorded yet.
      </div>
    );
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'In Progress':
        return <ArrowRightCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          <div className="absolute -left-6 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-sky-500 group-hover:scale-110 transition-all shadow-sm">
            {getStatusIcon(item.new_status)}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-sm group-hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  {item.old_status ? `${item.old_status} ➔ ${item.new_status}` : `Created as ${item.new_status}`}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {item.actor_name}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {formatDate(item.timestamp)}
              </span>
            </div>

            {item.note && (
              <div className="mt-2 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-100 italic">
                "{item.note}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
