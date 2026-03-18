import { useCallback } from 'react';
import { useStakeholderData } from './hooks/useStakeholderData';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ScatterPlot from './components/ScatterPlot';
import StakeholderDirectory from './components/StakeholderDirectory';
import Footer from './components/Footer';

function App() {
  const {
    categories,
    selectedCategories,
    toggleCategory,
    selectAll,
    clearAll,
    searchQuery,
    setSearchQuery,
    highlightedId,
    setHighlightedId,
    categoryCounts,
    filteredScored,
    filteredAll,
  } = useStakeholderData();

  const handlePointClick = useCallback(
    (id) => {
      setHighlightedId(id);
    },
    [setHighlightedId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/80">
      <Header />

      {/* Sidebar + Plot layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-4">
        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          categoryCounts={categoryCounts}
          onToggle={toggleCategory}
          onSelectAll={selectAll}
          onClearAll={clearAll}
        />
        <div className="flex-1 min-w-0">
          <ScatterPlot
            stakeholders={filteredScored}
            categories={categories}
            onPointClick={handlePointClick}
            highlightedId={highlightedId}
          />
          <p className="text-xs text-slate-400 text-center mt-2 tracking-wide">
            Scroll to zoom <span className="text-slate-300 mx-1">&middot;</span> Drag to pan <span className="text-slate-300 mx-1">&middot;</span> Click any point for details
          </p>
        </div>
      </div>

      <StakeholderDirectory
        stakeholders={filteredAll}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        highlightedId={highlightedId}
      />
      <Footer />
    </div>
  );
}

export default App;
