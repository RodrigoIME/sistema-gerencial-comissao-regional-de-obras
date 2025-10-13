import { useState, useMemo, useCallback } from 'react';

export interface FilterConfig<T> {
  searchFields?: (keyof T)[];
  statusField?: keyof T;
  dateField?: keyof T;
  sortField?: keyof T;
}

export interface FilterState {
  searchTerm: string;
  status: string;
  dateRange?: { from?: Date; to?: Date };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  customFilters: Record<string, any>;
}

export const useTableFilters = <T extends Record<string, any>>(
  data: T[],
  config?: FilterConfig<T>
) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    customFilters: {},
  });

  const filteredData = useMemo(() => {
    let result = [...data];

    // Filtro de busca
    if (filters.searchTerm && config?.searchFields) {
      result = result.filter((item) =>
        config.searchFields!.some((field) => {
          const value = item[field];
          return value?.toString().toLowerCase().includes(filters.searchTerm.toLowerCase());
        })
      );
    }

    // Filtro de status
    if (filters.status !== 'all' && config?.statusField) {
      result = result.filter((item) => item[config.statusField!] === filters.status);
    }

    // Filtro de data
    if (filters.dateRange?.from && config?.dateField) {
      result = result.filter((item) => {
        const itemDate = new Date(item[config.dateField!]);
        return itemDate >= filters.dateRange!.from!;
      });
    }
    if (filters.dateRange?.to && config?.dateField) {
      result = result.filter((item) => {
        const itemDate = new Date(item[config.dateField!]);
        return itemDate <= filters.dateRange!.to!;
      });
    }

    // Filtros customizados
    Object.entries(filters.customFilters).forEach(([key, value]) => {
      if (value !== 'all' && value !== undefined && value !== '') {
        result = result.filter((item) => item[key] === value);
      }
    });

    // Ordenação
    result.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return filters.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return filters.sortOrder === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return filters.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return result;
  }, [data, filters, config]);

  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setDateRange = useCallback((range: { from?: Date; to?: Date }) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const setCustomFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      customFilters: { ...prev.customFilters, [key]: value },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      customFilters: {},
    });
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange?.from) count++;
    if (filters.dateRange?.to) count++;
    count += Object.values(filters.customFilters).filter(
      (v) => v !== 'all' && v !== undefined && v !== ''
    ).length;
    return count;
  }, [filters]);

  return {
    filters,
    filteredData,
    setSearchTerm,
    setStatus,
    setDateRange,
    setSorting,
    setCustomFilter,
    clearFilters,
    activeFiltersCount,
  };
};
