import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce em um valor
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (default: 500ms)
 * @returns Valor debounced
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
