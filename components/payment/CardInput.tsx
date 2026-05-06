"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CardInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal";
  autoComplete?: string;
  maxLength?: number;
  rightSlot?: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function CardInput({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  placeholder,
  inputMode = "text",
  autoComplete,
  maxLength,
  rightSlot,
  className,
  required,
}: CardInputProps) {
  const id = useId();
  const errorId = `${id}-err`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          className={cn(
            "h-11 bg-surface-elevated border-border focus-visible:ring-brand",
            error && "border-destructive focus-visible:ring-destructive",
            rightSlot && "pr-20"
          )}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div>
        )}
      </div>
      <p
        id={errorId}
        role={error ? "alert" : undefined}
        className={cn(
          "min-h-4 text-xs text-destructive transition-opacity",
          error ? "opacity-100" : "opacity-0"
        )}
      >
        {error || " "}
      </p>
    </div>
  );
}
