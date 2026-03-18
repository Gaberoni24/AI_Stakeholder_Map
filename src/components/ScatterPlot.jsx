import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { CATEGORY_COLORS, getCategoryColor } from '../assets/colors';

const Plot = createPlotlyComponent(Plotly);

// Determine which labels to show based on overlap detection.
// Labels prioritized by power + interest (most important stakeholders first).
function getVisibleLabels(points, xRange, yRange, plotWidth, plotHeight) {
  const xMin = xRange?.[0] ?? 0;
  const xMax = xRange?.[1] ?? 10;
  const yMin = yRange?.[0] ?? 0;
  const yMax = yRange?.[1] ?? 10;
  const xSpan = xMax - xMin;
  const ySpan = yMax - yMin;

  // Use actual plot area (subtract Plotly margins: l:50+r:20=70, t:20+b:40=60)
  const effectiveW = Math.max(plotWidth - 70, 400);
  const effectiveH = Math.max(plotHeight - 60, 300);
  const pxPerUnitX = effectiveW / xSpan;
  const pxPerUnitY = effectiveH / ySpan;
  const fontSize = 11;

  const inView = [];
  points.forEach((s, i) => {
    if (
      s.interestJittered >= xMin - 0.5 &&
      s.interestJittered <= xMax + 0.5 &&
      s.powerJittered >= yMin - 0.5 &&
      s.powerJittered <= yMax + 0.5
    ) {
      inView.push(i);
    }
  });

  inView.sort((a, b) => (points[b].power + points[b].interest) - (points[a].power + points[a].interest));

  const placed = [];
  const result = new Set();

  for (const idx of inView) {
    const s = points[idx];
    const charCount = s.player.length;
    // Tighter char-width factor (Inter is narrow)
    const halfW = (charCount * fontSize * 0.26) / pxPerUnitX;
    const h = (fontSize * 1.6) / pxPerUnitY;
    const box = {
      x0: s.interestJittered - halfW,
      x1: s.interestJittered + halfW,
      y0: s.powerJittered,
      y1: s.powerJittered + h,
    };

    let overlaps = false;
    for (const p of placed) {
      if (box.x0 < p.x1 && box.x1 > p.x0 && box.y0 < p.y1 && box.y1 > p.y0) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      placed.push(box);
      result.add(idx);
    }
  }

  return result;
}

export default function ScatterPlot({ stakeholders, categories, onPointClick, highlightedId }) {
  const [axisRange, setAxisRange] = useState({ x: [0, 10.5], y: [0, 10.5] });
  const [containerSize, setContainerSize] = useState({ width: 900, height: 650 });
  const [popup, setPopup] = useState(null);
  const plotRef = useRef(null);
  const containerRef = useRef(null);

  const isZoomed = axisRange.x[0] > 0.1 || axisRange.x[1] < 10.4 ||
                   axisRange.y[0] > 0.1 || axisRange.y[1] < 10.4;

  // Track container size with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const markerSize = useMemo(() => {
    const xSpan = axisRange.x[1] - axisRange.x[0];
    const zoomFactor = 10.5 / xSpan;
    if (zoomFactor >= 4) return 14;
    if (zoomFactor >= 2) return 12;
    if (zoomFactor >= 1.5) return 10;
    return 8;
  }, [axisRange]);

  const traces = useMemo(() => {
    const visibleGlobal = getVisibleLabels(
      stakeholders, axisRange.x, axisRange.y,
      containerSize.width, containerSize.height
    );
    const visibleIds = new Set();
    visibleGlobal.forEach(idx => visibleIds.add(stakeholders[idx].id));

    const dataTraces = categories
      .filter(cat => stakeholders.some(s => s.category === cat))
      .map(cat => {
        const points = stakeholders.filter(s => s.category === cat);

        return {
          x: points.map(s => s.interestJittered),
          y: points.map(s => s.powerJittered),
          text: points.map(s => s.player),
          customdata: points.map(s => s.id),
          mode: 'markers+text',
          type: 'scatter',
          name: cat,
          marker: {
            color: CATEGORY_COLORS[cat] || '#999',
            size: markerSize,
            opacity: 0.9,
            line: { width: 1.5, color: 'rgba(255,255,255,0.9)' },
          },
          textposition: 'top center',
          textfont: { size: 11, color: '#334155', family: 'Inter, system-ui, sans-serif' },
          texttemplate: points.map(s =>
            visibleIds.has(s.id) ? s.player : ''
          ),
          hovertemplate: points.map(
            s =>
              `<b>${s.player}</b><br>` +
              `${s.category}<br>` +
              `Power: ${s.power}  ·  Interest: ${s.interest}` +
              `<extra></extra>`
          ),
          hoverlabel: {
            bgcolor: '#1e293b',
            bordercolor: 'transparent',
            font: { family: 'Inter, system-ui, sans-serif', size: 13, color: '#f8fafc' },
            align: 'left',
          },
        };
      });

    if (highlightedId != null) {
      const hl = stakeholders.find(s => s.id === highlightedId);
      if (hl) {
        dataTraces.push({
          x: [hl.interestJittered],
          y: [hl.powerJittered],
          mode: 'markers',
          type: 'scatter',
          name: '_highlight',
          showlegend: false,
          hoverinfo: 'skip',
          marker: {
            size: markerSize + 10,
            color: 'rgba(59, 130, 246, 0.15)',
            line: { width: 2.5, color: '#3b82f6' },
          },
        });
      }
    }

    return dataTraces;
  }, [stakeholders, categories, axisRange, markerSize, highlightedId, containerSize]);

  const layout = useMemo(
    () => ({
      xaxis: {
        title: { text: 'Interest', font: { size: 13, color: '#94a3b8', family: 'Inter, system-ui, sans-serif' } },
        range: [0, 10.5],
        dtick: 1,
        gridcolor: '#f1f5f9',
        gridwidth: 1,
        zeroline: false,
        fixedrange: false,
        constrain: 'range',
        constraintoward: 'center',
        minallowed: 0,
        maxallowed: 10.5,
      },
      yaxis: {
        title: { text: 'Power', font: { size: 13, color: '#94a3b8', family: 'Inter, system-ui, sans-serif' } },
        range: [0, 10.5],
        dtick: 1,
        gridcolor: '#f1f5f9',
        gridwidth: 1,
        zeroline: false,
        fixedrange: false,
        constrain: 'range',
        constraintoward: 'center',
        minallowed: 0,
        maxallowed: 10.5,
      },
      shapes: [
        {
          type: 'rect', x0: 5, x1: 10.5, y0: 5, y1: 10.5,
          fillcolor: 'rgba(59, 130, 246, 0.06)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'rect', x0: 0, x1: 5, y0: 5, y1: 10.5,
          fillcolor: 'rgba(245, 158, 11, 0.06)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'rect', x0: 5, x1: 10.5, y0: 0, y1: 5,
          fillcolor: 'rgba(16, 185, 129, 0.06)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'rect', x0: 0, x1: 5, y0: 0, y1: 5,
          fillcolor: 'rgba(156, 163, 175, 0.06)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'line', x0: 5, x1: 5, y0: 0, y1: 10.5,
          line: { dash: 'dot', color: '#cbd5e1', width: 1.5 },
        },
        {
          type: 'line', x0: 0, x1: 10.5, y0: 5, y1: 5,
          line: { dash: 'dot', color: '#cbd5e1', width: 1.5 },
        },
      ],
      annotations: [
        { x: 7.75, y: 9.9, text: '<b>KEY PLAYERS</b>', showarrow: false, font: { size: 13, color: '#3b82f6', family: 'Inter, system-ui, sans-serif' } },
        { x: 7.75, y: 9.4, text: 'High Power · High Interest', showarrow: false, font: { size: 10, color: '#93c5fd', family: 'Inter, system-ui, sans-serif' } },
        { x: 2.5, y: 9.9, text: '<b>KEEP SATISFIED</b>', showarrow: false, font: { size: 13, color: '#f59e0b', family: 'Inter, system-ui, sans-serif' } },
        { x: 2.5, y: 9.4, text: 'High Power · Low Interest', showarrow: false, font: { size: 10, color: '#fcd34d', family: 'Inter, system-ui, sans-serif' } },
        { x: 7.75, y: 0.85, text: '<b>KEEP INFORMED</b>', showarrow: false, font: { size: 13, color: '#10b981', family: 'Inter, system-ui, sans-serif' } },
        { x: 7.75, y: 0.35, text: 'Low Power · High Interest', showarrow: false, font: { size: 10, color: '#6ee7b7', family: 'Inter, system-ui, sans-serif' } },
        { x: 2.5, y: 0.85, text: '<b>MONITOR</b>', showarrow: false, font: { size: 13, color: '#9ca3af', family: 'Inter, system-ui, sans-serif' } },
        { x: 2.5, y: 0.35, text: 'Low Power · Low Interest', showarrow: false, font: { size: 10, color: '#d1d5db', family: 'Inter, system-ui, sans-serif' } },
      ],
      showlegend: false,
      margin: { t: 20, b: 40, l: 50, r: 20 },
      dragmode: 'pan',
      hovermode: 'closest',
      plot_bgcolor: '#ffffff',
      paper_bgcolor: 'rgba(0,0,0,0)',
      autosize: true,
      font: { family: 'Inter, system-ui, sans-serif' },
    }),
    []
  );

  const config = useMemo(
    () => ({
      responsive: true,
      displayModeBar: false,
      scrollZoom: true,
    }),
    []
  );

  const handleClick = useCallback(
    (event) => {
      if (event.points && event.points[0]) {
        const pt = event.points[0];
        const id = pt.customdata;
        if (id == null) return;

        const s = stakeholders.find(s => s.id === id);
        if (!s) return;

        const rawEvent = event.event;
        const clientX = rawEvent?.clientX ?? 0;
        const clientY = rawEvent?.clientY ?? 0;

        setPopup({ x: clientX, y: clientY, stakeholder: s });
      }
    },
    [stakeholders]
  );

  // Dismiss popup on Escape
  useEffect(() => {
    if (!popup) return;
    const handler = (e) => {
      if (e.key === 'Escape') setPopup(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [popup]);

  // Dismiss popup on click outside
  useEffect(() => {
    if (!popup) return;
    const handler = () => setPopup(null);
    const id = setTimeout(() => {
      window.addEventListener('click', handler);
    }, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener('click', handler);
    };
  }, [popup]);

  const handleViewDetails = useCallback(() => {
    if (popup) {
      onPointClick(popup.stakeholder.id);
      setPopup(null);
    }
  }, [popup, onPointClick]);

  const handleResetZoom = useCallback(() => {
    const el = plotRef.current?.el;
    if (el) {
      Plotly.relayout(el, { 'xaxis.range': [0, 10.5], 'yaxis.range': [0, 10.5] });
    }
    setAxisRange({ x: [0, 10.5], y: [0, 10.5] });
  }, []);

  const debounceRef = useRef(null);

  const handleRelayout = useCallback((update) => {
    setPopup(null);

    let newX = null;
    let newY = null;

    if (update['xaxis.range[0]'] != null && update['xaxis.range[1]'] != null) {
      newX = [
        Math.max(0, update['xaxis.range[0]']),
        Math.min(10.5, update['xaxis.range[1]']),
      ];
    }
    if (Array.isArray(update['xaxis.range'])) {
      newX = [
        Math.max(0, update['xaxis.range'][0]),
        Math.min(10.5, update['xaxis.range'][1]),
      ];
    }
    if (update['yaxis.range[0]'] != null && update['yaxis.range[1]'] != null) {
      newY = [
        Math.max(0, update['yaxis.range[0]']),
        Math.min(10.5, update['yaxis.range[1]']),
      ];
    }
    if (Array.isArray(update['yaxis.range'])) {
      newY = [
        Math.max(0, update['yaxis.range'][0]),
        Math.min(10.5, update['yaxis.range'][1]),
      ];
    }
    if (update['xaxis.autorange'] || update['yaxis.autorange']) {
      newX = [0, 10.5];
      newY = [0, 10.5];
    }

    if (newX || newY) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setAxisRange(prev => ({
          x: newX || prev.x,
          y: newY || prev.y,
        }));
      }, 150);
    }
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Block zoom-out scroll when already at full view
  useEffect(() => {
    const el = plotRef.current?.el;
    if (!el) return;

    const handler = (e) => {
      if (e.deltaY <= 0) return;

      const fullLayout = el._fullLayout;
      if (!fullLayout) return;
      const xr = fullLayout.xaxis.range;
      const yr = fullLayout.yaxis.range;

      if (xr[0] <= 0.01 && xr[1] >= 10.49 && yr[0] <= 0.01 && yr[1] >= 10.49) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    el.addEventListener('wheel', handler, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', handler, { capture: true });
  }, []);

  // Compute popup position clamped to viewport
  const popupStyle = useMemo(() => {
    if (!popup) return {};
    const popupW = 280;
    const popupH = 180;
    const margin = 12;

    let left = popup.x - popupW / 2;
    let top = popup.y + margin;

    if (top + popupH > window.innerHeight - margin) {
      top = popup.y - popupH - margin;
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - popupW - margin));
    top = Math.max(margin, top);

    return { left, top, width: popupW };
  }, [popup]);

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]
                   ring-1 ring-slate-100 p-2 w-full"
        style={{ height: 'min(80vh, 750px)', minHeight: '500px' }}
      >
        <Plot
          ref={plotRef}
          data={traces}
          layout={layout}
          config={config}
          onClick={handleClick}
          onRelayout={handleRelayout}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {isZoomed && (
        <button
          onClick={handleResetZoom}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5
                     bg-white/90 backdrop-blur-md border border-slate-200
                     rounded-lg text-xs font-medium text-slate-600
                     hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/80
                     shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          Reset zoom
        </button>
      )}

      {popup && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]
                     ring-1 ring-slate-200/60 p-4 animate-[fadeIn_0.15s_ease]"
          style={popupStyle}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setPopup(null)}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600
                       cursor-pointer rounded-md hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h4 className="font-semibold text-slate-900 text-sm pr-6 leading-snug">
            {popup.stakeholder.player}
          </h4>
          <span
            className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium text-white"
            style={{ backgroundColor: getCategoryColor(popup.stakeholder.category) }}
          >
            {popup.stakeholder.category}
          </span>
          {popup.stakeholder.power != null && (
            <div className="flex gap-4 mt-3 text-xs text-slate-600">
              <span>Power: <strong className="text-slate-800">{popup.stakeholder.power}</strong></span>
              <span>Interest: <strong className="text-slate-800">{popup.stakeholder.interest}</strong></span>
            </div>
          )}
          <button
            onClick={handleViewDetails}
            className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium
                       rounded-lg transition-colors cursor-pointer"
          >
            View details
          </button>
        </div>
      )}
    </div>
  );
}
