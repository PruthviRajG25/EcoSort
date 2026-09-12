"use client";

export const dynamic = "force-dynamic";

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
  Clock,
  Navigation,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Flag,
  ExternalLink,
  RotateCcw,
  Building2,
  ChevronRight,
  Phone,
} from "lucide-react";
import EcoMap from "@/components/shared/eco-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocationStore, CITIES_DATA } from "@/store/location-store";

// Helper function to return intuitive maneuver icons for route steps
function getManeuverIcon(step) {
  const type = (step?.type || "").toLowerCase();
  const modifier = (step?.modifier || "").toLowerCase();
  const instruction = (step?.instruction || "").toLowerCase();

  if (type === "arrive" || instruction.includes("arrive")) {
    return <Flag className="h-4 w-4 text-emerald-500" />;
  }
  if (type === "depart" || instruction.includes("depart")) {
    return <Navigation className="h-4 w-4 text-sky-500" />;
  }
  if (modifier.includes("right") || instruction.includes("right")) {
    return <CornerUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (modifier.includes("left") || instruction.includes("left")) {
    return <CornerUpLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (modifier.includes("u-turn") || instruction.includes("u-turn")) {
    return <RotateCcw className="h-4 w-4 text-amber-500" />;
  }
  return <ArrowUp className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />;
}

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
  const [travelMode, setTravelMode] = useState("driving"); // driving, bicycle, walking
  
  // Geocoder predictions state
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [searchingStart, setSearchingStart] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // Route metrics state
  const [routeMetrics, setRouteMetrics] = useState(null); // { distanceKm, durationMins, steps: [] }
  const [showDirections, setShowDirections] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("depots"); // "depots" | "directions"

  const getGoogleMapsUrl = () => {
    if (!selectedCenter) return "#";
    const modeParam = travelMode === "walking" ? "walking" : travelMode === "bicycle" ? "bicycling" : "driving";
    if (startCoords && startCoords.length === 2) {
      return `https://www.google.com/maps/dir/?api=1&origin=${startCoords[0]},${startCoords[1]}&destination=${selectedCenter.latitude},${selectedCenter.longitude}&travelmode=${modeParam}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}&travelmode=${modeParam}`;
  };

  const {
    selectedCityKey,
    userExactCoords,
    userLocationName,
    isGpsActive,
    gpsLoading: storeGpsLoading,
    setCity,
    detectExactLocation,
    getActiveCity,
    getDynamicCenters
  } = useLocationStore();

  // Load centers dynamically based on active city or user's exact GPS location
  useEffect(() => {
    const dynamicCenters = getDynamicCenters();
    setCentersList(dynamicCenters);
    if (dynamicCenters.length > 0) {
      setSelectedCenter(dynamicCenters[0]);
    }
    const currentCity = getActiveCity();
    const effectiveCoords = userExactCoords || currentCity.coords;
    setStartCoords(effectiveCoords);
    setStartLocationName(userLocationName || `${currentCity.name}, ${currentCity.state}`);
    setStartQuery(userLocationName || `${currentCity.name}, ${currentCity.state}`);
    setGpsAccessGranted(isGpsActive);
    setLoading(false);
  }, [selectedCityKey, userExactCoords, isGpsActive, userLocationName, getActiveCity, getDynamicCenters]);

  // Request browser Geolocation API
  const requestLocation = () => {
    detectExactLocation();
  };

  // Auto detect location on initial mount if supported
  useEffect(() => {
    if (!userExactCoords) {
      detectExactLocation();
    }
  }, [userExactCoords, detectExactLocation]);

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
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Active City: {getActiveCity().name}, {getActiveCity().state}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            📍 Interactive Navigation & Scrap Depots
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan your route, check transport duration/distance, and check real-time scrap purchase rates.
          </p>
        </div>

        {/* City & GPS Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Selector */}
          <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-zinc-500 font-semibold">City:</span>
            <select
              value={selectedCityKey}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              {Object.entries(CITIES_DATA).map(([key, city]) => (
                <option key={key} value={key} className="dark:bg-zinc-900">
                  {city.name} ({city.state})
                </option>
              ))}
            </select>
          </div>

          {/* GPS Button */}
          {isGpsActive ? (
            <Badge className="bg-emerald-500 text-white font-bold text-xs py-1.5 px-3 rounded-xl border-0 shadow-xs flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span>Exact GPS Connected</span>
            </Badge>
          ) : (
            <Button
              onClick={requestLocation}
              disabled={storeGpsLoading}
              variant="outline"
              size="sm"
              className="text-xs h-9 px-3.5 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              {storeGpsLoading ? (
                <div className="h-3.5 w-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-1.5" />
              ) : (
                <Locate className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              )}
              {storeGpsLoading ? "Detecting GPS..." : "Detect My Location"}
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
          {/* Left panel - Search & Depot List / Directions */}
          <div className="lg:col-span-5 flex flex-col space-y-3.5 h-[calc(100vh-14rem)] min-h-[550px]">
            {/* View Mode Toggle: Depots vs Directions */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shrink-0 shadow-2sm">
              <button
                type="button"
                onClick={() => setSidebarTab("depots")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                  sidebarTab === "depots"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <Building2 className="h-4 w-4 text-emerald-500" />
                <span>Recycling Depots</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold">
                  {filteredCenters.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("directions")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                  sidebarTab === "directions"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <Route className="h-4 w-4 text-emerald-500" />
                <span>Turn-by-Turn Route</span>
                {routeMetrics?.steps?.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black shadow-sm">
                    {routeMetrics.steps.length}
                  </span>
                )}
              </button>
            </div>

            {sidebarTab === "directions" ? (
              <div className="flex-1 flex flex-col space-y-3 min-h-0">
                {/* Destination & Navigation Overview Hero Card */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3.5 shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Destination Depot
                      </div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight mt-0.5 truncate">
                        {selectedCenter ? selectedCenter.name : "No Depot Selected"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {selectedCenter?.address || "Please select a depot from the map or list"}
                      </p>
                    </div>
                    {selectedCenter?.phone && (
                      <a
                        href={`tel:${selectedCenter.phone}`}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 transition-colors shrink-0"
                        title="Call Center"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Route Stat Pills */}
                  {routeMetrics ? (
                    <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/10 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Est. Time</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                          <Clock className="h-3.5 w-3.5" /> {routeMetrics.durationMins}m
                        </span>
                      </div>
                      <div className="border-x border-emerald-500/10">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Distance</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1 mt-0.5">
                          <Navigation className="h-3.5 w-3.5 text-sky-500" /> {routeMetrics.distanceKm} km
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Mode</span>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 capitalize flex items-center justify-center gap-1 mt-0.5">
                          {travelMode === "walking" ? (
                            <Footprints className="h-3.5 w-3.5" />
                          ) : travelMode === "bicycle" ? (
                            <Bike className="h-3.5 w-3.5" />
                          ) : (
                            <Car className="h-3.5 w-3.5" />
                          )}
                          {travelMode}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg font-medium">
                      Select a start location and destination to compute navigation route.
                    </div>
                  )}

                  {/* Travel Mode Toggle within directions */}
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
                            "flex-1 py-1.5 px-2 border rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2sm",
                            isActive
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* External Google Maps Button */}
                  {selectedCenter && (
                    <a
                      href={getGoogleMapsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-all shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
                      <span>Open Live GPS in Google Maps App</span>
                    </a>
                  )}
                </div>

                {/* Substantially Enlarged Step-by-Step Directions Container */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-100 dark:border-zinc-900/80">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Route className="h-4 w-4 text-emerald-500" />
                      Turn-by-Turn Guide ({routeMetrics?.steps?.length || 0} Steps)
                    </span>
                    <button
                      onClick={() => setSidebarTab("depots")}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      ← Back to Depots
                    </button>
                  </div>

                  {routeMetrics?.steps && routeMetrics.steps.length > 0 ? (
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin">
                      {routeMetrics.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/90 bg-zinc-50/60 dark:bg-zinc-900/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 transition-colors flex items-start gap-3"
                        >
                          {/* Maneuver Icon */}
                          <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2sm">
                            {getManeuverIcon(step)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                Step {idx + 1}
                              </span>
                              {step.distance > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/10 shrink-0">
                                  {step.distance < 1000
                                    ? `${Math.round(step.distance)} m`
                                    : `${(step.distance / 1000).toFixed(1)} km`}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mt-0.5">
                              {step.instruction}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
                      <Route className="h-8 w-8 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                      <p className="text-xs font-semibold">No active route calculated</p>
                      <p className="text-[11px] max-w-[220px]">
                        Choose your start location and destination depot to view step-by-step route directions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Depots & Filter Tab */
              <div className="flex-1 flex flex-col space-y-3.5 min-h-0">
                {/* Google Maps Route Box */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3.5 shadow-md shrink-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 pb-1 border-b border-zinc-100 dark:border-zinc-900/60">
                    <Route className="h-3.5 w-3.5 text-emerald-500 animate-pulse" /> Route Navigation & Waypoint
                  </div>

                  {/* Start / End inputs */}
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-blue-500">
                        START
                      </span>
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-emerald-600">
                        DEST
                      </span>
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

                  {/* Route Summary Results widget with Direct Navigation Button */}
                  {routeMetrics && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-lg space-y-2.5 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-center bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 px-2.5 py-1.5 rounded-md font-extrabold shrink-0">
                            <Clock className="h-3.5 w-3.5 mb-0.5" />
                            <span>{routeMetrics.durationMins}m</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs" title={startLocationName}>
                              Route from {startLocationName}
                            </div>
                            <div className="text-zinc-500 text-[10px] font-semibold mt-0.5">
                              Distance: {routeMetrics.distanceKm} km • {travelMode}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => setSidebarTab("directions")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 shadow-sm flex items-center gap-1.5"
                        >
                          <span>Directions</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Quick collapsible preview */}
                      <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-2xs">
                        <span className="text-zinc-500 font-medium">
                          {routeMetrics.steps?.length || 0} turn-by-turn steps ready
                        </span>
                        <button
                          onClick={() => setShowDirections(!showDirections)}
                          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>{showDirections ? "Hide Preview" : "Quick Steps Preview"}</span>
                          {showDirections ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>

                      {showDirections && routeMetrics.steps && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/10 max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                          {routeMetrics.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                              <span className="h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-snug">{step.instruction}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Filter Search depots section */}
                <div className="bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-sm shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="text"
                      placeholder="Search depots by name or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-full text-xs"
                    />
                  </div>

                  {/* Material Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <Filter className="h-3 w-3" /> Filter Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                      {materials.map((mat) => {
                        const isSelected = selectedMaterial === mat.id;
                        return (
                          <button
                            key={mat.id}
                            onClick={() => setSelectedMaterial(mat.id)}
                            className={cn(
                              "text-2xs px-2.5 py-1 rounded-lg border font-semibold transition-all",
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
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin min-h-0">
                  {filteredCenters.length > 0 ? (
                    filteredCenters.map((center) => {
                      const isSelected = selectedCenter?.id === center.id;
                      return (
                        <Card
                          key={center.id}
                          onClick={() => setSelectedCenter(center)}
                          className={cn(
                            "p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md",
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/15 shadow-sm"
                              : "border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/20"
                          )}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 leading-snug">
                                {center.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 font-extrabold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-500/10 shrink-0"
                              >
                                {center.distanceKm} km
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                              {center.address}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900/60">
                              <div className="flex flex-wrap gap-1">
                                {center.acceptedMaterials.slice(0, 3).map((mat, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-extrabold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full capitalize"
                                  >
                                    {mat}
                                  </span>
                                ))}
                                {center.acceptedMaterials.length > 3 && (
                                  <span className="text-[9px] font-bold text-zinc-400 px-1 py-0.5">
                                    +{center.acceptedMaterials.length - 3}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCenter(center);
                                  setSidebarTab("directions");
                                }}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                              >
                                <span>Route</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-950/10">
                      <MapPin className="h-8 w-8 text-zinc-300 dark:text-zinc-800 mb-2" />
                      <p className="text-xs font-semibold text-zinc-500">No matching depots found</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Try widening your search or filter settings</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
