"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SingleDatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function SingleDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  className,
  buttonClassName,
  id,
  disabled = false,
  required = false,
  error,
}: SingleDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor={id} className="px-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            disabled={disabled}
            className={cn(
              "justify-start font-normal",
              !buttonClassName && "w-48", // Default width only if no custom buttonClassName
              error && "border-red-500",
              buttonClassName,
              !value && "text-muted-foreground"
            )}
          >
            {" "}
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {value ? value.toLocaleDateString() : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={handleDateChange}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
      {error && <span className="text-red-500 text-sm px-1">{error}</span>}
    </div>
  );
}
