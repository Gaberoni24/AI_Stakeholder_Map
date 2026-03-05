import { useState, forwardRef } from 'react';
import { getCategoryColor } from '../assets/colors';

const StakeholderCard = forwardRef(function StakeholderCard(
  { stakeholder, isHighlighted },
  ref
) {
  const [expanded, setExpanded] = useState(false);
  const s = stakeholder;
  const color = getCategoryColor(s.category);
  const showExpanded = expanded || isHighlighted;

  return (
    <div
      ref={ref}
      id={`card-${s.id}`}
      onClick={() => setExpanded(prev => !prev)}
      className={`
        border rounded-xl p-4 cursor-pointer transition-all duration-200
        ${isHighlighted
          ? 'ring-2 ring-blue-400 bg-blue-50/50 border-blue-200 shadow-md'
          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug">
            {s.player}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {s.category}
            </span>
          </div>
        </div>
        {s.power != null && (
          <div className="flex gap-2 shrink-0">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-700">{s.power}</div>
              <div className="text-[9px] text-slate-400 uppercase">Pwr</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-700">{s.interest}</div>
              <div className="text-[9px] text-slate-400 uppercase">Int</div>
            </div>
          </div>
        )}
      </div>

      {showExpanded && s.rationale && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed animate-[fadeIn_0.2s_ease]">
          {s.quadrant && (
            <span className="inline-block mb-2 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
              {s.quadrant}
            </span>
          )}
          <p>{s.rationale}</p>
          {s.source && (
            <a
              href={s.source}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              View source
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
});

export default StakeholderCard;
