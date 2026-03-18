import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const AXIS_MIN = 0;
const AXIS_MAX = 10.5;

function getTouchPoints(e) {
  return Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function clampRange(min, max) {
  const span = max - min;
  // Don't allow zooming out past full view
  if (span >= AXIS_MAX - AXIS_MIN) return [AXIS_MIN, AXIS_MAX];
  // Don't allow zooming in past a tiny sliver
  if (span < 0.5) {
    const center = (min + max) / 2;
    min = center - 0.25;
    max = center + 0.25;
  }
  // Shift into bounds
  if (min < AXIS_MIN) { max += AXIS_MIN - min; min = AXIS_MIN; }
  if (max > AXIS_MAX) { min -= max - AXIS_MAX; max = AXIS_MAX; }
  return [Math.max(AXIS_MIN, min), Math.min(AXIS_MAX, max)];
}

export function useTouchZoomPan(plotRef) {
  const gestureRef = useRef(null);
  const rafRef = useRef(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    const el = plotRef.current?.el;
    if (!el) return;

    function scheduleRelayout(xRange, yRange) {
      pendingRef.current = { x: xRange, y: yRange };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const p = pendingRef.current;
          if (p) {
            Plotly.relayout(el, {
              'xaxis.range': p.x,
              'yaxis.range': p.y,
            });
          }
        });
      }
    }

    function getPlotBBox() {
      const dragLayer = el.querySelector('.nsewdrag');
      return dragLayer ? dragLayer.getBoundingClientRect() : null;
    }

    function pixelToData(px, py, bbox, xRange, yRange) {
      const fracX = (px - bbox.left) / bbox.width;
      const fracY = 1 - (py - bbox.top) / bbox.height; // Y is inverted
      return {
        x: xRange[0] + fracX * (xRange[1] - xRange[0]),
        y: yRange[0] + fracY * (yRange[1] - yRange[0]),
      };
    }

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const pts = getTouchPoints(e);
        const fullLayout = el._fullLayout;
        if (!fullLayout) return;

        const bbox = getPlotBBox();
        if (!bbox) return;

        gestureRef.current = {
          startPts: pts,
          startDist: distance(pts[0], pts[1]),
          startMid: midpoint(pts[0], pts[1]),
          startXRange: [...fullLayout.xaxis.range],
          startYRange: [...fullLayout.yaxis.range],
          bbox,
        };
      }
    }

    function onTouchMove(e) {
      if (!gestureRef.current || e.touches.length !== 2) return;
      e.preventDefault();
      e.stopPropagation();

      const g = gestureRef.current;
      const pts = getTouchPoints(e);
      const curDist = distance(pts[0], pts[1]);
      const curMid = midpoint(pts[0], pts[1]);

      // Scale factor: fingers moving apart = zoom in (scale < 1), together = zoom out
      const scale = g.startDist / curDist;

      // Midpoint in data space at gesture start
      const startMidData = pixelToData(
        g.startMid.x, g.startMid.y, g.bbox, g.startXRange, g.startYRange
      );

      // Where the midpoint has moved to, in data space using start range
      const curMidData = pixelToData(
        curMid.x, curMid.y, g.bbox, g.startXRange, g.startYRange
      );

      // Pan offset in data units
      const panDx = startMidData.x - curMidData.x;
      const panDy = startMidData.y - curMidData.y;

      // Zoom around start midpoint, then shift by pan
      let newXMin = startMidData.x + (g.startXRange[0] - startMidData.x) * scale + panDx;
      let newXMax = startMidData.x + (g.startXRange[1] - startMidData.x) * scale + panDx;
      let newYMin = startMidData.y + (g.startYRange[0] - startMidData.y) * scale + panDy;
      let newYMax = startMidData.y + (g.startYRange[1] - startMidData.y) * scale + panDy;

      const xRange = clampRange(newXMin, newXMax);
      const yRange = clampRange(newYMin, newYMax);

      scheduleRelayout(xRange, yRange);
    }

    function onTouchEnd(e) {
      if (!gestureRef.current) return;

      if (e.touches.length < 2) {
        // Cancel any pending rAF and do a final relayout
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (pendingRef.current) {
          Plotly.relayout(el, {
            'xaxis.range': pendingRef.current.x,
            'yaxis.range': pendingRef.current.y,
          });
          pendingRef.current = null;
        }
        gestureRef.current = null;

        // Prevent the lingering single finger from triggering a Plotly drag
        if (e.touches.length === 1) {
          e.preventDefault();
        }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    el.addEventListener('touchend', onTouchEnd, { passive: false, capture: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart, { capture: true });
      el.removeEventListener('touchmove', onTouchMove, { capture: true });
      el.removeEventListener('touchend', onTouchEnd, { capture: true });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [plotRef]);
}
