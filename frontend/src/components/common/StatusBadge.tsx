import React from 'react';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toUpperCase();

  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    REGISTERED: {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      label: 'Registered',
    },
    PROCESSING: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500 animate-pulse',
      label: 'AI Processing',
    },
    ANALYSED: {
      bg: 'bg-teal-50 border-teal-200',
      text: 'text-teal-700',
      dot: 'bg-teal-500',
      label: 'Analysed',
    },
    REQUIRES_REVIEW: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: 'Requires Review',
    },
    EVIDENCE_MISSING: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      label: 'Evidence Missing',
    },
    COMPLETED: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Completed',
    },
    HUMAN_DECISION_PENDING: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
      label: 'Human Review Pending',
    },
  };

  const style = styles[normalized] || {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: status.replace('_', ' '),
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  );
};
