"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function FileUploader({ value, onChange, disabled }: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:bg-muted/50 transition-colors cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        value && "border-primary/20 bg-muted/10"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <div className="relative w-full h-full p-2">
          <div className="relative w-full h-full overflow-hidden rounded-md">
            <Image
              src={value}
              alt="Upload preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors z-10"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Upload className="w-8 h-8" />
          <span className="text-xs font-medium">Clique para fazer upload</span>
        </div>
      )}
    </div>
  );
}
