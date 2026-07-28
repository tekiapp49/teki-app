"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { createPinIcon } from "./pin-icon";

function svg(path: string, s = 15) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#faf7f0" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
const ICON_STORE = svg('<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>');
const ICON_USERS = svg(
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
);

const userIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#d92ba3;outline:3px solid #faf7f0;box-shadow:0 1px 5px rgba(0,0,0,.35)"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function iconFor(type: "commerce" | "association", selected: boolean) {
  const inner = type === "commerce" ? ICON_STORE : ICON_USERS;
  if (selected) {
    return createPinIcon({
      color: "#d92ba3",
      size: 46,
      selected: true,
      iconSvg: svg(
        type === "commerce"
          ? '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>'
          : '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
        20,
      ),
    });
  }
  return createPinIcon({
    color: type === "commerce" ? "#201e1d" : "#0f9340",
    iconSvg: inner,
  });
}

function RecenterOnChange({
  center,
  zoom,
  fitRadius,
}: {
  center: [number, number];
  zoom: number;
  fitRadius?: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    const size = map.getSize();
    // Si un rayon est fourni, on calcule le zoom qui fait tenir le cercle
    // dans la VRAIE taille de la box (largeur ET hauteur). Gère aussi bien
    // un écran de téléphone (haut) qu'une mini-carte (large et courte).
    let targetZoom = zoom;
    if (fitRadius && size.x > 0 && size.y > 0) {
      const bounds = L.latLng(center[0], center[1]).toBounds(fitRadius * 2);
      targetZoom = map.getBoundsZoom(bounds, false, L.point(16, 16));
    }
    if (size.x === 0 || size.y === 0) {
      map.setView(center, targetZoom);
      return;
    }
    const cur = map.getCenter();
    const moved =
      Math.abs(cur.lat - center[0]) > 1e-5 || Math.abs(cur.lng - center[1]) > 1e-5;
    // Changement de lieu : animation douce. Changement de rayon seul :
    // application instantanée pour éviter que les animations s'empilent.
    if (moved) map.flyTo(center, targetZoom, { duration: 0.8 });
    else map.setView(center, targetZoom, { animate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom, fitRadius]);
  return null;
}

export type FichePin = {
  id: string;
  lat: number;
  lng: number;
  type: "commerce" | "association";
};

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  userLoc?: { lat: number; lng: number } | null;
  pins?: FichePin[];
  selectedId?: string | null;
  onSelectPin?: (id: string) => void;
  circle?: { lat: number; lng: number; radius: number } | null;
  interactive?: boolean;
};

export default function LeafletMap({
  center,
  zoom,
  userLoc,
  pins = [],
  selectedId,
  onSelectPin,
  circle,
  interactive = true,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterOnChange
        center={center}
        zoom={zoom}
        fitRadius={circle?.radius}
      />

      {circle && (
        <Circle
          center={[circle.lat, circle.lng]}
          radius={circle.radius}
          pathOptions={{
            color: "#d92ba3",
            weight: 2,
            fillColor: "#d92ba3",
            fillOpacity: 0.07,
          }}
        />
      )}

      {userLoc && <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon} />}

      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={iconFor(pin.type, pin.id === selectedId)}
          eventHandlers={{ click: () => onSelectPin?.(pin.id) }}
        />
      ))}
    </MapContainer>
  );
}
