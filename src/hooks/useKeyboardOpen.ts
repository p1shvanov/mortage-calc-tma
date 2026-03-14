import { useEffect, useState } from 'react';

/** Threshold (px): viewport height below (innerHeight - this) is considered "keyboard open" */
const KEYBOARD_HEIGHT_THRESHOLD = 60;

/**
 * Returns true when the on-screen keyboard is likely open
 * (visualViewport height is noticeably less than window.innerHeight).
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const check = () =>
      setOpen(
        window.visualViewport!.height < window.innerHeight - KEYBOARD_HEIGHT_THRESHOLD
      );
    check();
    window.visualViewport.addEventListener('resize', check);
    return () => window.visualViewport?.removeEventListener('resize', check);
  }, []);

  return open;
}
