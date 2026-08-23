import React from 'react';
import { Clock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status, isOverdue = false, size = "md" }) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = <Clock className="w-3.5 h-3.5" />;

  switch (status) {
    case 'Open':
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10";
      icon = <Clock className="w-3.5 h-3.5 text-blue-600" />;
      break;
    case 'In Progress':
      badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/10";
      icon = <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
      break;
    case 'Resolved':
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10";
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    default:
      break;
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${badgeStyle}`}>
        {icon}
        {status}
      </span>
      {isOverdue && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold ring-1 ring-rose-500/10 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          OVERDUE
        </span>
      )}
    </div>
  );
}
