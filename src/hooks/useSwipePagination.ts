import { useCallback, useRef } from 'react';

import { hapticSelection } from '@/utils/haptic';
import { SWIPE_MIN_DISTANCE } from '@/config/constants';

/**
 * Handles horizontal swipe gestures for pagination.
 * Returns touch handlers to attach to the container and a stable handleSwipeEnd.
 */
export function useSwipePagination(
  totalPages: number,
  _currentPage: number,
  setCurrentPage: (updater: (p: number) => number) => void,
  enabled: boolean
) {
  const touchStartRef = useRef({ x: 0, y: 0 });

  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || totalPages <= 1) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (
        Math.abs(dx) >= SWIPE_MIN_DISTANCE &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        if (dx < 0) {
          setCurrentPage((p) => Math.min(totalPages, p + 1));
        } else {
          setCurrentPage((p) => Math.max(1, p - 1));
        }
        hapticSelection();
      }
    },
    [enabled, totalPages, setCurrentPage]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  return {
    onTouchStart: enabled ? handleTouchStart : undefined,
    onTouchEnd: enabled ? handleSwipeEnd : undefined,
  };
}
