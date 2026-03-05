import { getCategoryColor } from '../assets/colors';

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggle,
  onSelectAll,
  onClearAll,
}) {
  const activeCount = selectedCategories.size;
  const totalCount = categories.length;

  return (
    <div className="shrink-0 w-full lg:w-64 xl:w-72">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sticky top-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Categories
          </h3>
          <span className="text-[10px] text-slate-400">
            {activeCount}/{totalCount}
          </span>
        </div>
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={onSelectAll}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer
                       px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            All
          </button>
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer
                       px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            None
          </button>
        </div>
        <div className="flex flex-col gap-0.5 max-h-[calc(75vh-60px)] overflow-y-auto pr-1">
          {categories.map(cat => {
            const active = selectedCategories.has(cat);
            const color = getCategoryColor(cat);
            return (
              <button
                key={cat}
                onClick={() => onToggle(cat)}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[11px] leading-tight
                  transition-all cursor-pointer
                  ${active
                    ? 'bg-slate-50 text-slate-700 font-medium'
                    : 'text-slate-400 hover:bg-slate-50'
                  }
                `}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-opacity"
                  style={{ backgroundColor: color, opacity: active ? 1 : 0.25 }}
                />
                <span className="min-w-0">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
