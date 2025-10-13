import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface TableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDefinition[];
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  children?: React.ReactNode;
}

/**
 * Componente reutilizável de filtros para tabelas
 * Inclui campo de busca, filtros dropdown e contador de filtros ativos
 */
export const TableFilters = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  activeFiltersCount = 0,
  onClearFilters,
  children,
}: TableFiltersProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Filtros</CardTitle>
          {activeFiltersCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""} ativo
              {activeFiltersCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {activeFiltersCount > 0 && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Tudo
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros dropdown */}
        {filters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filter.options.find((o) => o.value)?.value}
                onValueChange={(value) => {
                  // Evento customizado para comunicar mudança
                  const event = new CustomEvent(`filter-change-${filter.key}`, {
                    detail: value,
                  });
                  window.dispatchEvent(event);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}

        {/* Conteúdo adicional customizado */}
        {children}
      </CardContent>
    </Card>
  );
};
