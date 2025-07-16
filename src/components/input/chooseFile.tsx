"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { File, Image as ImageIcon, FileText } from "lucide-react";

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
  maxSizeInMB?: number;
  showMaxSize?: boolean;
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
  maxSizeInMB = 5,
  showMaxSize = false,
}: ChooseFileProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert(`File size must be less than ${maxSizeInMB}MB`);
        return;
      }
    }

    onChange(file);
  };

  const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onChange(null);
    // Reset the input value
    if (id) {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getDisplayContent = () => {
    if (value) {
      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {getFileIcon(value)}
            <span className="truncate">{value.name}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            disabled={disabled}
            className="text-black hover:text-foreground/80 text-sm underline ml-2 disabled:opacity-50"
          >
            Hapus
          </button>
        </div>
      );
    }
    return <span>Choose File</span>;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className="text-sm font-medium flex items-center gap-1"
        >
          {label}
          {required && <span>*</span>}
        </Label>
      )}

      {!value ? (
        // Render file input when no file is selected
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
              {placeholder}
            </span>
          </div>
        </div>
      ) : (
        // Render simple div when file is selected
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-2 border border-input rounded-md",
            disabled && "opacity-50"
          )}
        >
          <span className="font-medium text-sm w-full">
            {getDisplayContent()}
          </span>
        </div>
      )}

      {error && <span className="text-red-500 text-sm">{error}</span>}

      {showMaxSize && (
        <p className="text-xs text-gray-500">
          Maximum file size: {maxSizeInMB}MB
        </p>
      )}
    </div>
  );
}
