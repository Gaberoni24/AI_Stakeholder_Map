import { useEffect } from 'react';
import StakeholderCard from './StakeholderCard';

export default function StakeholderDirectory({
  stakeholders,
  searchQuery,
  onSearchChange,
  highlightedId,
}) {
  useEffect(() => {
    if (highlightedId != null) {
      const el = document.getElementById(`card-${highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedId]);

  const count = stakeholders.length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Stakeholder Directory
          <span className="ml-2 text-sm font-normal text-slate-400">
            {count} {count === 1 ? 'result' : 'results'}
          </span>
        </h2>
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by name, category, or keyword…"
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm
                       placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                       focus:border-blue-400 bg-white shadow-sm"
          />
        </div>
      </div>
      {count === 0 ? (
        <p className="text-center text-slate-400 py-12">
          No stakeholders match your filters.
        </p>
      ) : (
        <div className="columns-1 md:columns-2 gap-3 pb-8">
          {stakeholders.map(s => (
            <div key={s.id} className="break-inside-avoid mb-3">
              <StakeholderCard
                stakeholder={s}
                isHighlighted={s.id === highlightedId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
