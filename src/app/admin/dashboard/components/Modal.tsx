import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

interface ModalProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  footerButton?: React.ReactNode;
  className?: string;
}

export default function Modal({
  title,
  open,
  onOpenChange,
  children,
  footerButton,
  className = "sm:max-w-none w-[80vw] p-0 max-h-[85vh] overflow-hidden flex flex-col rounded-3xl",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className} showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b relative flex-shrink-0">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <DialogClose className="p-1 rounded-md bg-[#FFC0C5] text-[#D02533] opacity-100 hover:opacity-80">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        
        {children}
        
        {footerButton && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
            {footerButton}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
