// ─── useDebounce Hook ───────────────────────────────────────────────
// Returns a debounced version of the input value.
// The debounced value only updates after the user stops changing it
// for `delay` milliseconds.

import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);   // cleanup on value change
  }, [value, delay]);

  return debouncedValue;
}
