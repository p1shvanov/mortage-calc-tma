import { useEffect, type RefObject } from 'react';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

function dispatchChartResize(): void {
  window.dispatchEvent(new Event('resize'));
}

/**
 * Run resize after layout has been updated (next frame). When viewport grows, the effect runs
 * before the container has its new size; delaying ensures Chart.js reads the updated dimensions.
 */
function dispatchChartResizeAfterLayout(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(dispatchChartResize);
  });
}

/**
 * When the chart container or Telegram viewport size changes, dispatches a window "resize" event
 * so Chart.js (responsive: true) redraws the chart.
 * - ResizeObserver: reacts to container size changes (layout, CSS).
 * - useSignal(viewport.height/width): reacts to Telegram viewport updates (orientation, keyboard, expand).
 * Resize is delayed until after layout so charts expand correctly when viewport grows.
 */
export function useChartResize(containerRef: RefObject<HTMLElement | null>): void {
  const viewportHeight = useSignal(viewport.height);
  const viewportWidth = useSignal(viewport.width);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(dispatchChartResizeAfterLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    dispatchChartResizeAfterLayout();
  }, [viewportHeight, viewportWidth]);
}
