import { Slot } from "@radix-ui/react-slot";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const VisuallyHidden = ({ children, asChild = false }: VisuallyHiddenProps) => {
  const Comp = asChild ? Slot : "span";
  
  return (
    <Comp className="sr-only">
      {children}
    </Comp>
  );
};
