import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  message = "Carregando",
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-b-2 border-primary",
          sizeClasses[size]
        )}
        role="status"
        aria-label={message}
      />
      <span className="text-muted-foreground">{message}...</span>
      <span className="sr-only">{message}...</span>
    </div>
  );
};
