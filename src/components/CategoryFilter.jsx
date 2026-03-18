import { getCategoryColor } from '../assets/colors';

const CATEGORY_GROUPS = [
  {
    label: 'Government',
    categories: [
      'US FEDERAL GOVERNMENT - EXECUTIVE BRANCH',
      'US FEDERAL GOVERNMENT - LEGISLATIVE BRANCH',
      'US STATE GOVERNMENTS',
      'INTERNATIONAL GOVERNMENTS & REGULATORY BODIES',
      'INTERNATIONAL MULTILATERAL ORGANIZATIONS',
    ],
  },
  {
    label: 'Industry & Technology',
    categories: [
      'AI LABS & MAJOR TECH COMPANIES',
      'AI SAFETY & ALIGNMENT RESEARCH ORGANIZATIONS',
      'INDUSTRY GROUPS & TRADE ASSOCIATIONS',
      'INVESTORS & FUNDERS',
      'HEALTHCARE SECTOR',
    ],
  },
  {
    label: 'Research & Academia',
    categories: [
      'THINK TANKS & RESEARCH INSTITUTES',
      'ACADEMIC CENTERS & PROGRAMS',
      'EXISTING MAPPING RESOURCES',
    ],
  },
  {
    label: 'Civil Society & Public',
    categories: [
      'CIVIL SOCIETY, ADVOCACY & NONPROFITS',
      'LABOR & WORKER ORGANIZATIONS',
      'MEDIA & INFORMATION ECOSYSTEM',
      'KEY INDIVIDUAL VOICES & THOUGHT LEADERS',
      'AFFECTED BUT UNDERREPRESENTED POPULATIONS ("SLEEPING GIANTS")',
      'OFTEN-OVERLOOKED PLAYERS',
    ],
  },
];

export default function CategoryFilter({
  categories,
  selectedCategories,
  categoryCounts,
  onToggle,
  onSelectAll,
  onClearAll,
}) {
  const activeCount = selectedCategories.size;
  const totalCount = categories.length;

  return (
    <div className="shrink-0 w-full lg:w-64 xl:w-72">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 p-4 sticky top-4">
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
            className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer
                       px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            All
          </button>
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer
                       px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            None
          </button>
        </div>
        <div className="flex flex-col gap-0.5 max-h-[calc(75vh-60px)] overflow-y-auto pr-1 custom-scrollbar">
          {CATEGORY_GROUPS.map(group => {
            // Only show groups that have categories present in the data
            const groupCats = group.categories.filter(c => categories.includes(c));
            if (groupCats.length === 0) return null;

            return (
              <div key={group.label}>
                <div className="text-[9px] uppercase tracking-wider text-slate-300 font-semibold mt-2.5 mb-1 px-2">
                  {group.label}
                </div>
                {groupCats.map(cat => {
                  const active = selectedCategories.has(cat);
                  const color = getCategoryColor(cat);
                  const count = categoryCounts?.[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => onToggle(cat)}
                      className={`
                        flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs leading-tight
                        transition-all cursor-pointer w-full
                        ${active
                          ? 'bg-slate-50 text-slate-700 font-medium shadow-[inset_2px_0_0_currentColor]'
                          : 'text-slate-400 hover:bg-slate-50'
                        }
                      `}
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-opacity"
                        style={{ backgroundColor: color, opacity: active ? 1 : 0.25 }}
                      />
                      <span className="min-w-0 flex-1">{cat}</span>
                      <span className={`text-[10px] tabular-nums shrink-0 ${active ? 'text-slate-400' : 'text-slate-300'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
