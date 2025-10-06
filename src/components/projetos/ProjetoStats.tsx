import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProjetoStatsProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const ProjetoStats = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: ProjetoStatsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-xs">
            <span
              className={
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="ml-2 text-muted-foreground">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
