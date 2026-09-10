"use client";

import React, { useState } from "react";
import { ScanBarcode, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EPR_DATABASE = [
  {
    barcode: "8901030865421",
    brand: "Tetra Pak",
    product: "Multi-layer Beverage Carton",
    rating: "A",
    materials: "75% FSC Paperboard, 20% Polyethylene, 5% Aluminum Foil",
    takeBackAvailable: true,
    programName: "Tetra Pak Carton Recycling Drive",
    instructions: "Flatten the carton, push straw inside, and drop at authorized school/supermarket collection bins.",
    incentive: "Earn 100 EcoSort Points per 10 cartons returned.",
    url: "https://www.tetrapak.com/sustainability",
  },
  {
    barcode: "194252192758",
    brand: "Apple",
    product: "iPhone & iPad Accessories",
    rating: "A+",
    materials: "100% Recycled Aluminum Enclosure, Rare Earth Elements",
    takeBackAvailable: true,
    programName: "Apple Trade In & Free Mail-In Recycling",
    instructions: "Bring any old Apple device, charging cable, or brick to any Apple Store or request a free prepaid shipping label.",
    incentive: "Apple Gift Card credit towards next purchase or 100% free eco-refurbishing.",
    url: "https://www.apple.com/trade-in",
  },
  {
    barcode: "8901262010057",
    brand: "Amul",
    product: "Milk Pouch (LDPE Plastic)",
    rating: "B+",
    materials: "Low-Density Polyethylene (LDPE Grade 4)",
    takeBackAvailable: true,
    programName: "Amul Plastic Pouch Return Scheme",
    instructions: "Cut only a corner tip (don't detach small scraps!), rinse pouch with water, dry and accumulate.",
    incentive: "Return to local milk booth for ₹0.50 refund per pouch.",
    url: "https://amul.com",
  },
  {
    barcode: "7622201748281",
    brand: "Cadbury / Mondelez",
    product: "Chocolate Wrapper (Multi-layered Plastic)",
    rating: "C",
    materials: "Metallized BoPP Plastic Film",
    takeBackAvailable: false,
    programName: "Municipal Cement Kiln Co-processing",
    instructions: "Clean wrapper cannot be recycled in standard curbside bins; dispose in designated dry-waste or drop at EPR plastic banks.",
    incentive: "Earn 20 EcoSort points for scanning.",
    url: "https://www.mondelezinternational.com",
  },
  {
    barcode: "8806091234567",
    brand: "Samsung",
    product: "Galaxy Smartphone / Charger",
    rating: "A",
    materials: "Recycled Ocean Plastics, Glass, Cobalt, Copper",
    takeBackAvailable: true,
    programName: "Samsung Care E-Waste Drop-off",
    instructions: "Drop old batteries, cables, and phones into Samsung E-Waste bins at 500+ authorized service centres.",
    incentive: "Get up to ₹500 discount voucher on original accessories.",
    url: "https://www.samsung.com/in/recycling",
  },
  {
    barcode: "049000000443",
    brand: "Coca-Cola",
    product: "PET Beverage Bottle & Cap",
    rating: "A-",
    materials: "100% Recyclable Polyethylene Terephthalate (rPET)",
    takeBackAvailable: true,
    programName: "World Without Waste Return Lockers",
    instructions: "Empty, rinse, crush bottle, and leave cap on for automated sorting optical sensors.",
    incentive: "Eligible for Smart Bin RVM cash credits.",
    url: "https://www.coca-colacompany.com/sustainability",
  },
];

export default function EprScanner() {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(EPR_DATABASE[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    const found = EPR_DATABASE.find(
      (p) =>
        p.barcode.includes(clean) ||
        p.brand.toLowerCase().includes(clean) ||
        p.product.toLowerCase().includes(clean)
    );

    if (found) {
      setSelectedProduct(found);
    } else {
      setSelectedProduct({
        barcode: query,
        brand: "Custom Brand / Generic Item",
        product: "Consumer Packaging",
        rating: "B",
        materials: "Mixed Commercial Packaging",
        takeBackAvailable: false,
        programName: "Local Municipal Dry Waste Channel",
        instructions: "Rinse clean and sort into dry waste stream or drop off at local recycling depot.",
        incentive: "50 EcoSort scan points awarded.",
        url: "#",
      });
    }
  };

  return (
    <Card className="border border-indigo-500/20 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <ScanBarcode className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <span>Brand EPR & Packaging Scanner</span>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[10px] font-semibold border-indigo-300 dark:border-indigo-700">
                Extended Producer Responsibility
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Look up brands to discover official take-back programs, mail-in returns, and recyclability scores
            </CardDescription>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 pt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search barcode or brand (e.g. Tetra Pak, Apple, Amul, Coca-Cola)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0">
            Scan / Search
          </Button>
        </form>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {selectedProduct && (
          <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl p-4 border border-zinc-200/60 dark:border-zinc-800/80 space-y-3">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {selectedProduct.brand}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {selectedProduct.product}
                </h4>
                <div className="text-[11px] font-mono text-zinc-400">
                  Barcode: {selectedProduct.barcode}
                </div>
              </div>

              {/* Eco Rating Badge */}
              <div className="text-center p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60">
                <div className="text-[10px] font-bold text-zinc-500">Recyclability</div>
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  Grade {selectedProduct.rating}
                </div>
              </div>
            </div>

            {/* Materials Breakdown */}
            <div className="text-xs space-y-1">
              <span className="text-zinc-400 font-semibold">Packaging Composition:</span>
              <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                {selectedProduct.materials}
              </p>
            </div>

            {/* Take-Back Program Banner */}
            <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
              selectedProduct.takeBackAvailable
                ? "bg-emerald-50/70 border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50/70 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-200"
            }`}>
              <div className="flex items-center space-x-1.5 font-bold">
                {selectedProduct.takeBackAvailable ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Official Brand Take-Back Program Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>No Direct Brand Take-Back: Use Standard Dry Recycling</span>
                  </>
                )}
              </div>
              <div className="font-semibold text-[11px]">{selectedProduct.programName}</div>
              <p className="text-[11px] leading-relaxed opacity-90">{selectedProduct.instructions}</p>
              {selectedProduct.incentive && (
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 pt-1">
                  🎁 Return Perk: {selectedProduct.incentive}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
