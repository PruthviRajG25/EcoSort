"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Leaf, Menu, X, Sun, Moon, LogIn, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useUserStore();
  const router = useRouter();

  // Scroll effect to make navbar glassmorphic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Statistics", href: "/#statistics" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-full border-b border-transparent",
        {
          "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-sm": scrolled,
          "bg-transparent": !scrolled,
        }
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-emerald-500 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-emerald-500/20">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
            EcoSort <span className="text-zinc-900 dark:text-zinc-100">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-zinc-600 dark:text-zinc-300"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push("/login")}
              className="flex items-center space-x-1.5"
            >
              <LogIn className="h-4 w-4" />
              <span>Get Started</span>
            </Button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Mobile Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-zinc-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95 backdrop-blur-md"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-semibold text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 py-2 border-b border-zinc-100 dark:border-zinc-900"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3 pt-2">
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/dashboard");
                    }}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center justify-center space-x-2 pt-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Get Started</span>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Quick helper to bypass circular imports of cn
import { cn } from "@/lib/utils";
export default Navbar;
