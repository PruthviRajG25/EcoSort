import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-950/40">
        {children}
      </main>
      <Footer />
    </div>
  );
}
