import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  error?: string;
}

export const FileUploadZone = ({ 
  id, 
  file, 
  onFileChange, 
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  label = "Clique para anexar o documento",
  error
}: FileUploadZoneProps) => {
  return (
    <div>
      <div className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        error ? "border-destructive" : "hover:border-primary",
        file && "bg-secondary/50"
      )}>
        <input
          id={id}
          type="file"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="hidden"
          accept={accept}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        
        {!file ? (
          <Label htmlFor={id} className="cursor-pointer block">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{label}</p>
          </Label>
        ) : (
          <div className="flex items-center justify-between gap-3 p-3 bg-background rounded border">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFileChange(null)}
              className="shrink-0"
              aria-label={`Remover arquivo ${file.name}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
