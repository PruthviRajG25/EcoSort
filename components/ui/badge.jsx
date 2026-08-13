import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-primary text-primary-foreground shadow-sm": variant === "default",
          "bg-secondary text-secondary-foreground": variant === "secondary",
          "text-zinc-900 border border-zinc-200 dark:text-zinc-50 dark:border-zinc-800": variant === "outline",
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30":
            variant === "success",
          "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/30":
            variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/50 dark:border-red-800/30":
            variant === "destructive",
          "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30":
            variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
