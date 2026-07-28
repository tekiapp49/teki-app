"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
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
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) map.setView(center, zoom);
    else map.flyTo(center, zoom, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);
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
};

export default function LeafletMap({
  center,
  zoom,
  userLoc,
  pins = [],
  selectedId,
  onSelectPin,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterOnChange center={center} zoom={zoom} />

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
