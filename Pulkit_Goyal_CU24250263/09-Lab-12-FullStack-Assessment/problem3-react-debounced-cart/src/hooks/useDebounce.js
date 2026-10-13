import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays updating the debounced value until after delay ms has elapsed without typing.
 * Prevents excessive API network calls during user keystrokes.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer on re-render / typing before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
