import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 text-muted-foreground">
        {icon || <FileX className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty state for tables
export function TableEmptyState({
  title = "Tidak ada data",
  description = "Belum ada data yang tersedia untuk ditampilkan.",
  action,
  icon,
  colSpan = 8
}: Omit<EmptyStateProps, 'className'> & { colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-t">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={action}
          className="min-h-[300px]"
        />
      </td>
    </tr>
  );
}