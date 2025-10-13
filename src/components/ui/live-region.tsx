import { cn } from "@/lib/utils";

interface LiveRegionProps {
  children: React.ReactNode;
  role?: "status" | "alert";
  ariaLive?: "polite" | "assertive" | "off";
  className?: string;
}

export const LiveRegion = ({ 
  children, 
  role = "status", 
  ariaLive = "polite",
  className 
}: LiveRegionProps) => {
  return (
    <div 
      role={role} 
      aria-live={ariaLive} 
      aria-atomic="true"
      className={cn("", className)}
    >
      {children}
    </div>
  );
};
