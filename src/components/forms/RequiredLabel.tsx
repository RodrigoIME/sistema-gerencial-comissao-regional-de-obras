import { Label } from "@/components/ui/label";

interface RequiredLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

export const RequiredLabel = ({ htmlFor, children, required = true }: RequiredLabelProps) => (
  <Label htmlFor={htmlFor} className="flex items-center gap-1">
    {children}
    {required && <span className="text-destructive text-base">*</span>}
  </Label>
);
