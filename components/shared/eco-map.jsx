"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, ShieldAlert } from "lucide-react";

export default function EcoMap({
  centers = [],
  selectedCenter = null,
  onSelectCenter = () => {},
  startCoords = null,
  travelMode = "driving",
  onRouteCalculated = () => {},
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const routeShadowRef = useRef(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapError, setMapError] = useState(null);

  // 1. Programmatically load Leaflet CSS & JS from unpkg CDN
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    script.onerror = () => setMapError("Failed to load map libraries. Check internet connection.");
    document.body.appendChild(script);
  }, []);

  // 2. Initialize Leaflet Map once loaded
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    
    // Default view: Bangalore (or startCoords if provided)
    const initialView = startCoords || [12.9719, 77.5937];
    
    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false, // We'll add custom positioned zoom controls
        attributionControl: false,
      }).setView(initialView, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add clean custom zoom buttons on bottom-right
      L.control.zoom({
        position: "bottomright"
      }).addTo(map);

      mapRef.current = map;
    } catch (err) {
      console.error("Leaflet initialization failed:", err);
      setMapError("Failed to render interactive map.");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, startCoords]);

  // 3. Update User Location Marker when startCoords changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !startCoords) return;

    const L = window.L;
    const map = mapRef.current;

    // Create user location pulse icon
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-300 opacity-40 animate-ping"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-md"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(startCoords);
    } else {
      userMarkerRef.current = L.marker(startCoords, { icon: userIcon })
        .addTo(map)
        .bindPopup("<div class='font-bold text-xs text-zinc-950'>Your Location</div>");
    }
  }, [leafletLoaded, startCoords]);

  // 4. Render Depot Markers
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !centers.length) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    centers.forEach((center) => {
      const isSelected = selectedCenter && (selectedCenter.id === center.id || selectedCenter._id === center.id);
      
      const depotIcon = L.divIcon({
        className: `custom-depot-marker-${center.id}`,
        html: `
          <div class="flex items-center justify-center">
            <div class="relative flex items-center justify-center shadow-lg transition-all duration-300 rounded-full text-white border border-white
              ${isSelected 
                ? 'w-10 h-10 bg-emerald-500 ring-4 ring-emerald-500/20 scale-110' 
                : 'w-8 h-8 bg-zinc-950 dark:bg-zinc-900 hover:bg-emerald-600 hover:scale-105'
              }">
              <span class="text-xs leading-none">${isSelected ? '📍' : '♻️'}</span>
            </div>
          </div>
        `,
        iconSize: isSelected ? [40, 40] : [32, 32],
        iconAnchor: isSelected ? [20, 20] : [16, 16],
      });

      const marker = L.marker([center.latitude, center.longitude], { icon: depotIcon })
        .addTo(map)
        .on("click", () => {
          onSelectCenter(center);
        });

      // Simple tooltip
      marker.bindTooltip(
        `<div class='font-semibold text-xs py-0.5 text-zinc-950'>${center.name}</div>`,
        { direction: "top", offset: [0, -10] }
      );

      markersRef.current[center.id || center._id] = marker;
    });
  }, [leafletLoaded, centers, selectedCenter, onSelectCenter]);

  // 5. Handle fly-to view centering when selectedCenter changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !selectedCenter) return;

    const map = mapRef.current;
    
    // Zoom in on destination if there's no active route
    if (!startCoords) {
      map.flyTo([selectedCenter.latitude, selectedCenter.longitude], 14, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [leafletLoaded, selectedCenter, startCoords]);

  // 6. Fetch OSRM Route directions, distance & time
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !startCoords || !selectedCenter) {
      // Clear route lines if dependencies are missing
      if (routePolylineRef.current) routePolylineRef.current.remove();
      if (routeShadowRef.current) routeShadowRef.current.remove();
      routePolylineRef.current = null;
      routeShadowRef.current = null;
      return;
    }

    const L = window.L;
    const map = mapRef.current;

    const fetchRoute = async () => {
      setLoadingRoute(true);
      
      const startLat = startCoords[0];
      const startLon = startCoords[1];
      const destLat = selectedCenter.latitude;
      const destLon = selectedCenter.longitude;

      // Translate travel mode profiles for OSRM public API
      // profiles: driving, foot (walking), bicycle (cycling)
      let profile = "driving";
      if (travelMode === "walking") profile = "foot";
      if (travelMode === "bicycle") profile = "bicycle";

      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`;

      try {
        const response = await fetch(osrmUrl);
        if (!response.ok) {
          throw new Error(`OSRM returned status ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.routes || !data.routes.length) {
          throw new Error("No routes found between these locations.");
        }

        const route = data.routes[0];
        const geometry = route.geometry;
        const coordinates = geometry.coordinates.map((coord) => [coord[1], coord[0]]); // Swap back to [lat, lon]

        // Clear existing polylines
        if (routePolylineRef.current) routePolylineRef.current.remove();
        if (routeShadowRef.current) routeShadowRef.current.remove();

        // 1. Draw route shadow border
        routeShadowRef.current = L.polyline(coordinates, {
          color: "#0369a1", // sky-700
          weight: 7,
          opacity: 0.4,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // 2. Draw active route line
        routePolylineRef.current = L.polyline(coordinates, {
          color: "#0ea5e9", // sky-500
          weight: 4.5,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // Fit map bounds to show route
        map.fitBounds(routePolylineRef.current.getBounds(), {
          padding: [50, 50],
          animate: true,
          duration: 1.2,
        });

        // 3. Extract steps
        const legs = route.legs[0];
        const steps = legs.steps.map((step) => {
          const name = step.name || "Street";
          const modifier = step.maneuver.modifier ? ` ${step.maneuver.modifier}` : "";
          const type = step.maneuver.type;
          
          let instruction = `${type.charAt(0).toUpperCase() + type.slice(1)}${modifier} onto ${name}`;
          if (type === "depart") {
            instruction = `Depart from starting location heading onto ${name}`;
          } else if (type === "arrive") {
            instruction = `Arrive at destination: ${selectedCenter.name}`;
          }
          
          return {
            instruction,
            distance: step.distance,
            duration: step.duration,
          };
        });

        // 4. Report back results
        onRouteCalculated({
          distanceKm: (legs.distance / 1000).toFixed(1),
          durationMins: Math.ceil(legs.duration / 60),
          steps,
        });
      } catch (err) {
        console.error("OSRM Routing failed, falling back to straight line:", err);
        // Fallback: Great Circle Straight line representation
        const coords = [startCoords, [destLat, destLon]];

        if (routePolylineRef.current) routePolylineRef.current.remove();
        if (routeShadowRef.current) routeShadowRef.current.remove();

        routePolylineRef.current = L.polyline(coords, {
          color: "#f43f5e", // rose-500 fallback color
          weight: 4,
          opacity: 0.8,
          dashArray: "5, 5",
        }).addTo(map);

        map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });

        // Simple straight line math estimates
        const distance = calculateHaversineDistance(startLat, startLon, destLat, destLon);
        
        let speed = 30; // km/h driving
        if (travelMode === "walking") speed = 5;
        else if (travelMode === "bicycle") speed = 15;

        const duration = (distance / speed) * 60; // mins

        onRouteCalculated({
          distanceKm: distance.toFixed(1),
          durationMins: Math.ceil(duration),
          steps: [
            { instruction: "Depart heading directly towards recycling center", distance: distance * 1000, duration: duration * 60 },
            { instruction: `Arrive at recycling center destination: ${selectedCenter.name}`, distance: 0, duration: 0 },
          ],
        });
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded, startCoords, selectedCenter, travelMode]);

  // Haversine formula for fallback distance
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="relative w-full h-full bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
      {/* Map Error Banner */}
      {mapError && (
        <div className="absolute top-4 left-4 right-4 z-[400] bg-red-500/10 border border-red-500/20 backdrop-blur-md px-4 py-3 rounded-lg flex items-center space-x-3 text-xs text-red-600 dark:text-red-400 font-semibold shadow-md">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{mapError}</span>
        </div>
      )}

      {/* Loading Leaflet Libraries State */}
      {!leafletLoaded && !mapError && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-10 w-10">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
            <div className="relative rounded-full bg-emerald-500 text-white p-2.5 shadow-md">
              <Compass className="h-5 w-5 animate-spin" />
            </div>
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold animate-pulse">
            Loading interactive mapping libraries...
          </span>
        </div>
      )}

      {/* Leaflet DOM container hook */}
      <div
        ref={mapContainerRef}
        id="leaflet-eco-map"
        className={`w-full h-full transition-opacity duration-500 z-0 ${
          leafletLoaded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Route Recalculating Overlay */}
      {loadingRoute && (
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center z-[400] transition-all">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 shadow-xl flex items-center space-x-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <div className="h-4.5 w-4.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Recalculating Google route...</span>
          </div>
        </div>
      )}

      {/* Leaflet CSS Inline Customizations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background-color: transparent !important;
          font-family: inherit !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(0,0,0,0.15) !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: rgb(255 255 255) !important;
          color: rgb(39 39 42) !important;
          border-bottom: 1px solid rgba(0,0,0,0.08) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 15px !important;
          font-weight: bold;
          transition: background-color 150ms;
        }
        .leaflet-bar a:hover {
          background-color: rgb(244 244 245) !important;
        }
        .dark .leaflet-bar a {
          background-color: rgb(9 9 11) !important;
          color: rgb(244 244 245) !important;
          border-bottom: 1px solid rgb(24 24 27) !important;
        }
        .dark .leaflet-bar a:hover {
          background-color: rgb(24 24 27) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          padding: 2px !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }
        .leaflet-tooltip {
          background-color: white !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          padding: 4px 8px !important;
        }
        .dark .leaflet-tooltip {
          background-color: rgb(9 9 11) !important;
          border: 1px solid rgb(39 39 42) !important;
          color: white !important;
        }
      ` }} />
    </div>
  );
}
