import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  const mockData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => usePagination(mockData));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3); // 50 items / 20 per page
    expect(result.current.paginatedData).toHaveLength(20);
  });

  it('deve navegar para próxima página', () => {
    const { result } = renderHook(() => usePagination(mockData));
    
    act(() => {
      result.current.goToNextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
  });

  it('deve navegar para página anterior', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPage: 2 }));
    
    act(() => {
      result.current.goToPreviousPage();
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('não deve ultrapassar última página', () => {
    const { result } = renderHook(() => usePagination(mockData));
    
    act(() => {
      result.current.goToPage(999);
    });
    
    expect(result.current.currentPage).toBe(3);
  });

  it('deve calcular hasNextPage corretamente', () => {
    const { result } = renderHook(() => usePagination(mockData));
    
    expect(result.current.hasNextPage).toBe(true);
    
    act(() => {
      result.current.goToLastPage();
    });
    
    expect(result.current.hasNextPage).toBe(false);
  });
});
