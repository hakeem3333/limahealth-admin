import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates `delay`ms after the
 * last change. Use this for search inputs feeding a React Query key — the
 * query key should only change once the user pauses typing, not on every
 * keystroke, otherwise each keystroke creates a brand-new cache entry with
 * no data yet and the UI flashes to its loading state.
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
