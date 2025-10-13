import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('deve retornar valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('deve debounce mudanças de valor', async () => {
    vi.useFakeTimers();
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'changed', delay: 500 });
    
    // Valor ainda não mudou
    expect(result.current).toBe('initial');
    
    // Aguardar debounce
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('changed');
    
    vi.useRealTimers();
  });

  it('deve cancelar debounce anterior', async () => {
    vi.useFakeTimers();
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    rerender({ value: 'first' });
    vi.advanceTimersByTime(300);
    
    rerender({ value: 'second' });
    vi.advanceTimersByTime(500);
    
    expect(result.current).toBe('second');
    
    vi.useRealTimers();
  });
});
