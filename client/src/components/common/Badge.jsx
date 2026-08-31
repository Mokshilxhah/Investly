import React from 'react';

export const DecisionBadge = ({ status }) => {
  const configs = {
    INVEST: {
      label: 'Invest',
      className: 'bg-[#9df5a9] text-slate-950 font-extrabold',
      dot: 'bg-slate-950',
    },
    WATCHLIST: {
      label: 'Watchlist',
      className: 'bg-[#fedd89] text-slate-950 font-extrabold',
      dot: 'bg-slate-950',
    },
    REJECT: {
      label: 'Reject',
      className: 'bg-[#ffbaba] text-slate-950 font-extrabold',
      dot: 'bg-slate-950',
    },
    UNDER_EVALUATION: {
      label: 'Evaluating',
      className: 'bg-[#b0a2ff] text-slate-950 font-extrabold',
      dot: 'bg-slate-950',
    },
  };

  const config = configs[status] || configs.UNDER_EVALUATION;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-display tracking-tight shadow-xs flex-shrink-0 whitespace-nowrap ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const StageBadge = ({ stage }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold font-display bg-slate-100 text-slate-700 border border-slate-200/80 flex-shrink-0 whitespace-nowrap">
      {stage || 'Seed'}
    </span>
  );
};

export const ScoreBadge = ({ score, label = 'Score' }) => {
  if (score === undefined || score === null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 font-display flex-shrink-0 whitespace-nowrap">
        N/A
      </span>
    );
  }

  let badgeColor = 'bg-slate-100 text-slate-900 font-extrabold';
  if (score >= 8.0) {
    badgeColor = 'bg-[#9df5a9] text-slate-950 font-extrabold';
  } else if (score >= 6.0) {
    badgeColor = 'bg-[#fedd89] text-slate-950 font-extrabold';
  } else {
    badgeColor = 'bg-[#ffbaba] text-slate-950 font-extrabold';
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-display shadow-xs flex-shrink-0 whitespace-nowrap ${badgeColor}`}>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span>{score.toFixed(1)}/10</span>
    </div>
  );
};

export const IndustryBadge = ({ industry }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold font-display bg-slate-100 text-slate-700 border border-slate-200/80 flex-shrink-0 whitespace-nowrap">
    {industry}
  </span>
);
