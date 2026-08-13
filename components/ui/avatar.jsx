import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-16 w-16 text-xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full select-none justify-center items-center font-bold tracking-wider shadow-sm",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || "Avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white dark:from-emerald-500 dark:to-teal-700">
            {fallback.toUpperCase().slice(0, 2)}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
