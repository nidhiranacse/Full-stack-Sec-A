import { useEffect, useState } from "react";

/**
 * useDebounce — delays updating the returned value until
 * `delay` ms have passed since the last change to `value`.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
