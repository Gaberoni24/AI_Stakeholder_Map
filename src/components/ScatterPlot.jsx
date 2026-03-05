import { useMemo, useCallback, useState, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { CATEGORY_COLORS } from '../assets/colors';

const Plot = createPlotlyComponent(Plotly);

// Seeded PRNG for deterministic "random" label selection
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick ~n items spread across the array using seeded random
function pickSpread(arr, n, seed = 1) {
  if (arr.length <= n) return new Set(arr.map((_, i) => i));
  const rng = mulberry32(seed);
  const step = arr.length / n;
  const picked = new Set();
  for (let i = 0; i < n; i++) {
    const base = Math.floor(i * step);
    const jitter = Math.floor(rng() * Math.min(step, arr.length - base));
    picked.add(Math.min(base + jitter, arr.length - 1));
  }
  return picked;
}

// Determine which labels to show based on zoom level
function getVisibleLabels(points, xRange, yRange) {
  // Calculate zoom level: how much of the 0-10 range is visible
  const xSpan = (xRange?.[1] ?? 10) - (xRange?.[0] ?? 0);
  const ySpan = (yRange?.[1] ?? 10) - (yRange?.[0] ?? 0);
  const zoomFactor = 100 / (xSpan * ySpan); // 1 at full view, higher when zoomed

  // Filter to points in view
  const inView = [];
  points.forEach((s, i) => {
    const xMin = xRange?.[0] ?? 0;
    const xMax = xRange?.[1] ?? 10;
    const yMin = yRange?.[0] ?? 0;
    const yMax = yRange?.[1] ?? 10;
    if (
      s.interestJittered >= xMin - 0.5 &&
      s.interestJittered <= xMax + 0.5 &&
      s.powerJittered >= yMin - 0.5 &&
      s.powerJittered <= yMax + 0.5
    ) {
      inView.push(i);
    }
  });

  // Scale labels shown with zoom: ~8 at full, up to all when zoomed in tight
  let labelsToShow;
  if (zoomFactor >= 10) {
    labelsToShow = inView.length; // show all when very zoomed in
  } else if (zoomFactor >= 4) {
    labelsToShow = Math.min(inView.length, Math.floor(inView.length * 0.7));
  } else if (zoomFactor >= 2) {
    labelsToShow = Math.min(inView.length, Math.floor(inView.length * 0.4));
  } else {
    labelsToShow = Math.min(inView.length, 8);
  }

  const picked = pickSpread(inView, labelsToShow, 42);
  const result = new Set();
  inView.forEach((origIdx, i) => {
    if (picked.has(i)) result.add(origIdx);
  });
  return result;
}

export default function ScatterPlot({ stakeholders, categories, onPointClick }) {
  const [axisRange, setAxisRange] = useState({ x: [0, 10.5], y: [0, 10.5] });
  const plotRef = useRef(null);

  const traces = useMemo(() => {
    // Group all stakeholders by category, then decide labels per category
    return categories
      .filter(cat => stakeholders.some(s => s.category === cat))
      .map(cat => {
        const points = stakeholders.filter(s => s.category === cat);
        const visible = getVisibleLabels(points, axisRange.x, axisRange.y);

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
            size: 10,
            opacity: 0.9,
            line: { width: 1.5, color: 'rgba(255,255,255,0.9)' },
          },
          textposition: 'top center',
          textfont: { size: 9, color: '#334155', family: 'Inter, system-ui, sans-serif' },
          texttemplate: points.map((s, i) =>
            visible.has(i) ? s.player : ''
          ),
          hovertemplate: points.map(
            s =>
              `<b>${s.player}</b><br>` +
              `Category: ${s.category}<br>` +
              `Power: ${s.power} · Interest: ${s.interest}<br>` +
              `<i>Click for details</i>` +
              `<extra></extra>`
          ),
        };
      });
  }, [stakeholders, categories, axisRange]);

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
          fillcolor: 'rgba(59, 130, 246, 0.03)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'rect', x0: 0, x1: 5, y0: 5, y1: 10.5,
          fillcolor: 'rgba(245, 158, 11, 0.03)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'rect', x0: 5, x1: 10.5, y0: 0, y1: 5,
          fillcolor: 'rgba(16, 185, 129, 0.03)', line: { width: 0 },
          layer: 'below',
        },
        {
          type: 'rect', x0: 0, x1: 5, y0: 0, y1: 5,
          fillcolor: 'rgba(156, 163, 175, 0.03)', line: { width: 0 },
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
        { x: 7.75, y: 10.2, text: '<b>KEY PLAYERS</b>', showarrow: false, font: { size: 11, color: '#3b82f6', family: 'Inter, system-ui, sans-serif' } },
        { x: 2.5, y: 10.2, text: '<b>KEEP SATISFIED</b>', showarrow: false, font: { size: 11, color: '#f59e0b', family: 'Inter, system-ui, sans-serif' } },
        { x: 7.75, y: 0.35, text: '<b>KEEP INFORMED</b>', showarrow: false, font: { size: 11, color: '#10b981', family: 'Inter, system-ui, sans-serif' } },
        { x: 2.5, y: 0.35, text: '<b>MONITOR</b>', showarrow: false, font: { size: 11, color: '#9ca3af', family: 'Inter, system-ui, sans-serif' } },
      ],
      legend: {
        orientation: 'h',
        y: -0.15,
        x: 0.5,
        xanchor: 'center',
        font: { size: 9, family: 'Inter, system-ui, sans-serif' },
        itemclick: 'toggle',
        itemdoubleclick: 'toggleothers',
        bgcolor: 'rgba(255,255,255,0)',
      },
      margin: { t: 20, b: 110, l: 50, r: 15 },
      dragmode: 'zoom',
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
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toImage'],
      scrollZoom: true,
    }),
    []
  );

  const handleClick = useCallback(
    (event) => {
      if (event.points && event.points[0]) {
        const id = event.points[0].customdata;
        onPointClick(id);
      }
    },
    [onPointClick]
  );

  const handleRelayout = useCallback((update) => {
    const newRange = { ...axisRange };
    let changed = false;

    if (update['xaxis.range[0]'] != null && update['xaxis.range[1]'] != null) {
      newRange.x = [
        Math.max(0, update['xaxis.range[0]']),
        Math.min(10.5, update['xaxis.range[1]']),
      ];
      changed = true;
    }
    if (update['yaxis.range[0]'] != null && update['yaxis.range[1]'] != null) {
      newRange.y = [
        Math.max(0, update['yaxis.range[0]']),
        Math.min(10.5, update['yaxis.range[1]']),
      ];
      changed = true;
    }
    // Handle autorange / reset
    if (update['xaxis.autorange'] || update['yaxis.autorange']) {
      newRange.x = [0, 10.5];
      newRange.y = [0, 10.5];
      changed = true;
    }

    if (changed) setAxisRange(newRange);
  }, [axisRange]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-2"
           style={{ height: 'min(75vh, 800px)', minHeight: '500px' }}>
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
    </div>
  );
}
