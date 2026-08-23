import React from 'react';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

export default function PriorityBadge({ priority, size = "md" }) {
  let style = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = <ArrowRight className="w-3 h-3" />;

  switch (priority) {
    case 'High':
      style = "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
      icon = <ArrowUp className="w-3 h-3 text-rose-600" />;
      break;
    case 'Medium':
      style = "bg-amber-50 text-amber-800 border-amber-200 font-medium";
      icon = <ArrowRight className="w-3 h-3 text-amber-600" />;
      break;
    case 'Low':
      style = "bg-slate-50 text-slate-600 border-slate-200 font-medium";
      icon = <ArrowDown className="w-3 h-3 text-slate-500" />;
      break;
    default:
      break;
  }

  const padding = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border ${padding} ${style}`}>
      {icon}
      {priority}
    </span>
  );
}
