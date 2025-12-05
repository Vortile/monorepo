"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({
  value,
  onChange,
  className,
  ...props
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, "");
    let formatted = numbers;

    if (numbers.length <= 11) {
      if (numbers.length > 2) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      }
      if (numbers.length > 6) {
        // If 10 digits (landline): (XX) XXXX-XXXX
        // If 11 digits (mobile): (XX) XXXXX-XXXX
        // While typing, we don't know yet.
        // Standard approach: assume mobile (5 digits first part) if length > 10

        if (numbers.length <= 10) {
          formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(
            2,
            6
          )}-${numbers.slice(6)}`;
        } else {
          formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(
            2,
            7
          )}-${numbers.slice(7, 11)}`;
        }
      }
    } else {
      // Limit to 11 digits
      const truncated = numbers.slice(0, 11);
      formatted = `(${truncated.slice(0, 2)}) ${truncated.slice(
        2,
        7
      )}-${truncated.slice(7, 11)}`;
    }

    onChange(formatted);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      placeholder="(11) 99999-9999"
      maxLength={15}
      className={className}
    />
  );
}
