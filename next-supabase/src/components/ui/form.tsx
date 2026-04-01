"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "./button";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("space-y-4", className)} {...props} />
  ),
);
Form.displayName = "Form";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  label?: string;
  error?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, name, label, error, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  ),
);
FormField.displayName = "FormField";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ className, loading, children, disabled, ...props }, ref) => (
    <Button
      ref={ref}
      type="submit"
      className={cn("w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  ),
);
SubmitButton.displayName = "SubmitButton";

export { Form, FormField, SubmitButton };
