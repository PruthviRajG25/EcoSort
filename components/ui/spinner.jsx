"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const Spinner = ({ className, size = "md", ...props }) => {
  const [hovered, setHovered] = useState(false);

  const sizeMap = {
    sm: "h-6 w-6 stroke-[3px]",
    md: "h-12 w-12 stroke-[4px]",
    lg: "h-20 w-20 stroke-[5px]",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      <svg
        className={cn(
          "google-spinner",
          sizeMap[size]
        )}
        viewBox="0 0 66 66"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          // Increase spin speed when hovered!
          animationDuration: hovered ? "0.6s" : "1.4s",
          transition: "animation-duration 0.3s ease"
        }}
      >
        <circle
          className={cn(
            "google-spinner-path fill-none stroke-linecap-round"
          )}
          cx="33"
          cy="33"
          r="30"
          style={{
            stroke: "url(#eco-spinner-gradient)",
          }}
        />
        <defs>
          {/* Animated gradient or colorful gradients like Google */}
          <linearGradient id="eco-spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
            <stop offset="40%" stopColor="#059669" /> {/* Dark Emerald */}
            <stop offset="70%" stopColor="#3b82f6" /> {/* Blue */}
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Spinner;
export { Spinner };
