import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata = {
  title: "EcoSort AI - AI-Powered Waste Classification & Disposal Guide",
  description: "Identify waste types instantly using artificial intelligence. Get actionable recycling instructions, locate local depots, and build green habits with EcoSort AI.",
  keywords: ["recycle", "waste management", "AI waste classifier", "eco-friendly", "sustainability", "go green"],
  authors: [{ name: "EcoSort AI Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
