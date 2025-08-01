import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  count?: number;
  actionText?: string;
  onClick?: () => void;
}

export default function DashboardCard({
  icon: Icon,
  title,
  description,
  iconColor,
  count,
  actionText,
  onClick,
}: DashboardCardProps) {
  return (
    <Card
      className={`bg-white gap-4 pt-4 pb-0 ${
        onClick
          ? "hover:cursor-pointer hover:scale-102 transition-all duration-300"
          : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row gap-3 items-center justify-start px-4">
        <div
          className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-0">
        {count !== undefined && (
          <div className="text-2xl font-bold mb-2">{count}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {actionText && (
        <div className="border-t text-xs border-border flex gap-2 justify-center items-center py-3 text-medium">
          <p>{actionText}</p>
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </Card>
  );
}
