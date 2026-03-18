import { useState, useMemo, useCallback } from 'react';
import data from '../data/stakeholders.json';

export function useStakeholderData() {
  const { scored, unscored, categories } = data;
  const all = useMemo(() => [...scored, ...unscored], [scored, unscored]);

  const [selectedCategories, setSelectedCategories] = useState(() => new Set(categories));
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);

  const toggleCategory = useCallback((cat) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedCategories(new Set(categories));
  }, [categories]);

  const clearAll = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const s of all) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return counts;
  }, [all]);

  const filteredScored = useMemo(
    () => scored.filter(s => selectedCategories.has(s.category)),
    [scored, selectedCategories]
  );

  const filteredAll = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return all.filter(s => {
      if (!selectedCategories.has(s.category)) return false;
      if (!q) return true;
      return (
        s.player.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.rationale && s.rationale.toLowerCase().includes(q))
      );
    });
  }, [all, selectedCategories, searchQuery]);

  return {
    scored,
    unscored,
    all,
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
  };
}
