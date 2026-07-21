"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { createPinIcon } from "./pin-icon";

const userPin = createPinIcon("#2F5233");
const communePin = createPinIcon("#C1673B");

function RecenterOnChange({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    // flyTo anime en se basant sur la taille du conteneur : tant que
    // celui-ci n'a pas été mesuré par le navigateur (taille nulle, ex.
    // juste après le montage), l'animation produit des NaN. setView
    // reste sûr dans tous les cas.
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) {
      map.setView(center, zoom);
    } else {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);
  return null;
}

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  kind: "user" | "commune";
};

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  marker?: MapMarker | null;
};

export default function LeafletMap({ center, zoom, marker }: LeafletMapProps) {
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
      {marker && (
        <Marker
          position={[marker.lat, marker.lng]}
          icon={marker.kind === "user" ? userPin : communePin}
        />
      )}
    </MapContainer>
  );
}
