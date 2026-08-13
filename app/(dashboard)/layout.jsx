"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Leaf, Bell, LogOut, ChevronRight, LayoutDashboard, User, Settings, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";
import { Sidebar } from "@/components/shared/sidebar";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, getMe, logout } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const hasCookie = document.cookie.includes("ecosort_authenticated=true");
      if (!hasCookie && !isAuthenticated) {
        router.push("/login");
      } else if (hasCookie && !isAuthenticated) {
        try {
          await getMe();
        } catch (err) {
          console.error("Profile fetch failed, clearing session cookie:", err.message);
          // Delete client-side cookie to prevent infinite reload loops
          document.cookie = "ecosort_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          router.push("/login");
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, router, getMe]);

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Recycling Map", href: "/dashboard/map", icon: MapPin },
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path) =>
      path.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-16 w-16">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
            <div className="relative rounded-2xl bg-emerald-500 text-white p-3 shadow-lg shadow-emerald-500/20">
              <Leaf className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <span className="text-zinc-600 dark:text-zinc-400 text-sm font-semibold tracking-wider animate-pulse">
            Verifying Eco Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950/40">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Panel Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20">
          <div className="flex items-center space-x-3">
            {/* Mobile menu hamburger button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Breadcrumbs (Desktop only) */}
            <div className="hidden sm:flex items-center space-x-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                EcoSort
              </Link>
              {getBreadcrumbs().map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="h-4.5 w-4.5 text-zinc-300 dark:text-zinc-700" />
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{crumb}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications Alert Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </Button>

            {/* User Profile Avatar Dropdown Placeholder */}
            <div className="flex items-center space-x-3 pl-2 border-l border-zinc-100 dark:border-zinc-800">
              <Avatar
                fallback={getInitials(user?.name)}
                src={user?.avatarUrl}
                size="sm"
                className="ring-2 ring-emerald-500/20"
              />
              <span className="hidden lg:inline text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {user?.name.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm dark:bg-black/60 md:hidden"
            />

            {/* Slide-out Panel (Responsive Mobile Drawer) */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-zinc-950 z-50 p-6 flex flex-col justify-between md:hidden border-r border-zinc-200 dark:border-zinc-800"
            >
              <div>
                {/* Header Brand */}
                <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                      EcoSort AI
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-lg text-zinc-400"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Drawer Links */}
                <nav className="py-8 flex flex-col space-y-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          {
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400": isActive,
                            "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50": !isActive,
                          }
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Profile footer */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar
                    fallback={getInitials(user?.name)}
                    src={user?.avatarUrl}
                    size="sm"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {user?.ecoLevel}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="text-zinc-400 hover:text-red-500 rounded-full h-9 w-9"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
