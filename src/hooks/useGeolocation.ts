"use client";

import { useCallback, useState } from "react";

export type GeolocationState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied"; reason: "denied" | "unavailable" | "error" };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({ status: "denied", reason: "unavailable" });
      return;
    }

    setState({ status: "requesting" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setState({
          status: "denied",
          reason: error.code === error.PERMISSION_DENIED ? "denied" : "error",
        });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  return { state, request };
}
