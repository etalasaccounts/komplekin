import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { XIcon } from "lucide-react";

interface DrawerProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  steps?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Drawer({
  trigger,
  title,
  description,
  steps,
  children,
  footer,
  open,
  onOpenChange,
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col" showCloseButton={false}>
        <SheetHeader>
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {steps && <span className="text-sm font-medium text-nowrap">{steps}</span>}
              <SheetClose className="p-1 rounded-md bg-[#FFC0C5] text-[#D02533] opacity-100 hover:opacity-80">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4">
            {children}
        </div>

        {footer && (
          <SheetFooter>
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
} 