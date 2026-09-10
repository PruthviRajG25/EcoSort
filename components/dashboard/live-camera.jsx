"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment"
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access permission was denied. Please enable camera access in your browser."
          : "Unable to access camera device. Please ensure a camera is connected."
      );
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);


  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `waste-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        }
        setIsCapturing(false);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex flex-col items-center justify-center min-h-[360px]">
      {/* Top action bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Lens</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCameraFacing}
            className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-white/10"
            title="Switch camera"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (stream) {
                stream.getTracks().forEach((track) => track.stop());
              }
              onClose();
            }}
            className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-white/10"
            title="Close camera"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {cameraError ? (
        <div className="p-6 text-center space-y-3 max-w-sm">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-xs text-zinc-300 font-medium">{cameraError}</p>
          <Button size="sm" variant="outline" onClick={startCamera}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover max-h-[440px]"
          />

          {/* Hidden canvas for capturing bitmap */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner targeting crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-dashed border-emerald-400/70 rounded-2xl relative animate-pulse">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
            </div>
          </div>

          {/* Bottom capture trigger button */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="h-16 w-16 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer disabled:opacity-50"
              title="Snap & Classify"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Camera className="h-6 w-6" />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
