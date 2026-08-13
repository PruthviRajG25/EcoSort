"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, Settings, LogOut, Leaf, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserStore();

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Recycling Map", href: "/dashboard/map", icon: MapPin },
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 relative z-30",
        {
          "w-64": !isCollapsed,
          "w-20": isCollapsed,
        }
      )}
    >
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-full p-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors shadow-sm"
        aria-label="Collapse sidebar"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-900">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-emerald-500 text-white p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-emerald-500/20 shrink-0">
            <Leaf className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              EcoSort AI
            </span>
          )}
        </Link>
      </div>

      {/* Menu Links */}
      <nav className="flex-grow py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                {
                  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400": isActive,
                  "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50": !isActive,
                }
              )}
            >
              <Icon
                className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", {
                  "text-emerald-600 dark:text-emerald-400": isActive,
                  "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400": !isActive,
                })}
              />
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-16 bg-zinc-900 text-white dark:bg-zinc-800 text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50 border border-zinc-700">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div
          className={cn("flex items-center", {
            "justify-between": !isCollapsed,
            "justify-center": isCollapsed,
          })}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <Avatar
              fallback={getInitials(user?.name)}
              src={user?.avatarUrl}
              className="shrink-0 ring-2 ring-emerald-500/20"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.name || "Eco Friend"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.ecoLevel || "Eco Scout"}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-500 rounded-full h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-500 rounded-full h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
