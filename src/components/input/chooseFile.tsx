"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ChooseFileProps {
  label?: string;
  id?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  multiple?: boolean;
}

export function ChooseFile({
  label,
  id,
  accept = "image/*",
  onChange,
  value,
  placeholder = "No file chosen",
  className,
  disabled = false,
  required = false,
  error,
  multiple = false,
}: ChooseFileProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  const getDisplayText = () => {
    if (value) {
      return value.name;
    }
    return placeholder;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-2 border border-input rounded-md",
            "hover:bg-accent hover:text-accent-foreground transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500"
          )}
        >
          <span className="font-medium text-sm">Choose File</span>
          <span className="text-sm text-gray-500 truncate">
            {getDisplayText()}
          </span>
        </div>
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}
