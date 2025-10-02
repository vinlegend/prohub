"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";


const base =
  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow hover:bg-primary/90 dark:hover:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost:
    "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", isLoading, children, ...props }, ref) => {
    const classes = `${base} ${variants[variant]} ${className}`;

    return (
      <button ref={ref} className={classes} disabled={isLoading} {...props}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
