"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Filter,
  Car,
  Bike,
  Footprints,
  Locate,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Route,
  Clock
} from "lucide-react";
import EcoMap from "@/components/shared/eco-map";
import { api } from "@/lib/api";
import { MOCK_CENTERS } from "@/constants/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RecyclingMapPage() {
  const [centersList, setCentersList] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [loading, setLoading] = useState(true);

  // Google Maps navigation state
  const [startCoords, setStartCoords] = useState(null); // [lat, lon]
  const [startQuery, setStartQuery] = useState("");
  const [startLocationName, setStartLocationName] = useState("Not Selected (Choose location or grant GPS)");
  const [gpsAccessGranted, setGpsAccessGranted] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [travelMode, setTravelMode] = useState("driving"); // driving, bicycle, walking
  
  // Geocoder predictions state
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [searchingStart, setSearchingStart] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Route metrics state
  const [routeMetrics, setRouteMetrics] = useState(null); // { distanceKm, durationMins, steps: [] }
  const [showDirections, setShowDirections] = useState(false);

  // 1. Fetch centers from API on mount
  useEffect(() => {
    const loadCenters = async () => {
      setLoading(true);
      try {
        const response = await api.get("/waste/centers");
        if (response.success && response.data && response.data.length > 0) {
          const formatted = response.data.map((c) => ({
            id: c._id || c.id,
            name: c.name,
            address: c.address,
            latitude: c.latitude,
            longitude: c.longitude,
            contact: c.contact,
            phone: c.contact,
            website: c.website || "#",
            acceptedMaterials: c.categories || [],
            rates: c.rates || {},
            distanceKm: (1.2 + Math.random() * 4).toFixed(1),
          }));
          setCentersList(formatted);
          setSelectedCenter(formatted[0]);
        } else {
          setCentersList(MOCK_CENTERS);
          setSelectedCenter(MOCK_CENTERS[0]);
        }
      } catch (err) {
        console.error("Failed to load database centers, using mocks:", err.message);
        setCentersList(MOCK_CENTERS);
        setSelectedCenter(MOCK_CENTERS[0]);
      } finally {
        setLoading(false);
      }
    };
    loadCenters();
  }, []);

  // 2. Request browser Geolocation API
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setStartCoords([lat, lon]);
        setStartLocationName("My Current GPS Location");
        setStartQuery("My Current GPS Location");
        setGpsAccessGranted(true);
        setGpsLoading(false);
      },
      (error) => {
        console.warn("GPS access denied, defaulting to Bangalore center:", error.message);
        setGpsError("Permission denied. Set start manually or type below.");
        setGpsAccessGranted(false);
        setGpsLoading(false);
        // Default to Bangalore center coordinates as fallback
        setStartCoords([12.9719, 77.5937]);
        setStartLocationName("Bangalore Center (GPS Denied)");
        setStartQuery("Bangalore Center");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Auto request location on load
  useEffect(() => {
    requestLocation();
  }, []);

  // 3. Autocomplete Search for Start Location via Nominatim API
  useEffect(() => {
    if (!startQuery || startQuery === "My Current GPS Location" || startQuery === "Bangalore Center" || startQuery.length < 3) {
      setStartSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchingStart(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startQuery)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setStartSuggestions(data);
        }
      } catch (err) {
        console.error("Nominatim search failed:", err);
      } finally {
        setSearchingStart(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [startQuery]);

  // Click outside listener for start location suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const displayName = suggestion.display_name.split(",")[0] || suggestion.display_name;
    
    setStartCoords([lat, lon]);
    setStartLocationName(displayName);
    setStartQuery(displayName);
    setShowSuggestions(false);
  };

  // Materials definition
  const materials = [
    { id: "all", label: "All Streams" },
    { id: "plastic", label: "Plastic" },
    { id: "paper", label: "Paper/Cardboard" },
    { id: "metal", label: "Metal" },
    { id: "glass", label: "Glass" },
    { id: "e-waste", label: "E-Waste" },
    { id: "organic", label: "Organic" },
  ];

  // Filtering centers logic
  const filteredCenters = centersList.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMaterial =
      selectedMaterial === "all" ||
      center.acceptedMaterials.some((mat) => {
        if (selectedMaterial === "paper") {
          return mat.includes("paper") || mat.includes("cardboard");
        }
        return mat.toLowerCase().includes(selectedMaterial.toLowerCase());
      });

    return matchesSearch && matchesMaterial;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            📍 interactive Navigation & Scrap Depots
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan your route, check transport duration/distance, and check real-time scrap purchase rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {gpsAccessGranted ? (
            <Badge className="bg-emerald-500 text-white font-bold text-xs py-1 px-2.5 rounded-full border-0">
              ● Live GPS Connected
            </Badge>
          ) : (
            <Button
              onClick={requestLocation}
              disabled={gpsLoading}
              variant="outline"
              size="sm"
              className="text-xs h-9 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
            >
              {gpsLoading ? (
                <div className="h-3 w-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mr-1.5" />
              ) : (
                <Locate className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
              )}
              {gpsLoading ? "Connecting GPS..." : "Grant GPS Location"}
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-500 font-semibold animate-pulse">
            Loading navigation map dashboards...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left panel - Search & Depot List */}
          <div className="lg:col-span-5 flex flex-col space-y-4 h-[calc(100vh-14rem)] min-h-[550px]">
            {/* Google Maps Route Box */}
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3.5 shadow-md">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 pb-1 border-b border-zinc-100 dark:border-zinc-900/60">
                <Route className="h-3.5 w-3.5 text-emerald-500 animate-pulse" /> Google Maps Navigation Routing
              </div>

              {/* Start / End inputs */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-blue-500">START</span>
                  <Input
                    type="text"
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search start location..."
                    className="pl-16 h-10 w-full text-xs font-semibold"
                  />
                  {searchingStart && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Autocomplete prediction dropdown */}
                {showSuggestions && startSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-[180px] overflow-y-auto z-50 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {startSuggestions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSuggestion(item)}
                        className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer truncate font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        📍 {item.display_name}
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-emerald-600">DEST</span>
                  <Input
                    type="text"
                    value={selectedCenter ? selectedCenter.name : ""}
                    disabled
                    className="pl-16 h-10 w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              {/* Travel mode selectors */}
              <div className="flex gap-2">
                {[
                  { id: "driving", label: "Driving", icon: Car },
                  { id: "bicycle", label: "Cycling", icon: Bike },
                  { id: "walking", label: "Walking", icon: Footprints },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = travelMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setTravelMode(mode.id)}
                      className={cn(
                        "flex-1 py-2 px-3 border rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2sm",
                        isActive
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* GPS warning if permissions not granted */}
              {gpsError && (
                <div className="bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/10 text-2xs p-2 rounded-lg flex items-center space-x-1.5 font-bold">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* Route Summary Results widget */}
              {routeMetrics && (
                <div className="bg-emerald-50/40 dark:bg-emerald-950/5 border border-emerald-500/10 p-3.5 rounded-lg flex items-center justify-between text-xs transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="flex flex-col items-center bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1.5 rounded-md font-bold shrink-0">
                      <Clock className="h-3.5 w-3.5 mb-0.5" />
                      <span>{routeMetrics.durationMins}m</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[190px]" title={startLocationName}>
                        Route from {startLocationName}
                      </div>
                      <div className="text-zinc-500 text-[10px] font-semibold mt-0.5">
                        Distance: {routeMetrics.distanceKm} km | {travelMode}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDirections(!showDirections)}
                    className="text-emerald-500 dark:text-emerald-400 font-extrabold hover:underline flex items-center text-2xs gap-0.5"
                  >
                    <span>{showDirections ? "Hide Directions" : "View Steps"}</span>
                    {showDirections ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Step-by-Step Directions scroll container */}
            {showDirections && routeMetrics && routeMetrics.steps && (
              <Card className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3.5 max-h-[160px] overflow-y-auto animate-in fade-in slide-in-from-top-1 text-xs scrollbar-thin">
                <div className="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider pb-1 border-b">
                  Step Navigation Steps
                </div>
                <div className="space-y-3">
                  {routeMetrics.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                      <span className="h-4.5 w-4.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[9px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span>{step.instruction}</span>
                        {step.distance > 0 && (
                          <span className="text-[10px] text-muted-foreground block font-bold mt-0.5">
                            ({step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Filter Search depots section */}
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search depots by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full"
                />
              </div>

              {/* Material Badges */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Filter by Stream Categories
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {materials.map((mat) => {
                    const isSelected = selectedMaterial === mat.id;
                    return (
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat.id)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all",
                          isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        {mat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Depot List Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {filteredCenters.length > 0 ? (
                filteredCenters.map((center) => {
                  const isSelected = selectedCenter?.id === center.id;
                  return (
                    <Card
                      key={center.id}
                      onClick={() => setSelectedCenter(center)}
                      className={cn(
                        "p-4 border transition-all duration-200 cursor-pointer hover:shadow-md",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5 shadow-sm"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/20"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 leading-snug">
                            {center.name}
                          </h3>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-extrabold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-500/10 shrink-0">
                            {center.distanceKm} km
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                          {center.address}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900/60">
                          {center.acceptedMaterials.map((mat, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-extrabold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full capitalize"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-950/10">
                  <MapPin className="h-8 w-8 text-zinc-300 dark:text-zinc-800 mb-2" />
                  <p className="text-xs font-semibold text-zinc-500">No matching depots found</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Try widening your search or filter settings</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Leaflet Map Component */}
          <div className="lg:col-span-7 h-[calc(100vh-14rem)] min-h-[550px]">
            <EcoMap
              centers={filteredCenters}
              selectedCenter={selectedCenter}
              onSelectCenter={setSelectedCenter}
              startCoords={startCoords}
              travelMode={travelMode}
              onRouteCalculated={setRouteMetrics}
            />
          </div>
        </div>
      )}
    </div>
  );
}
