"use client";

import { useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapCoordinates = {
  lat: number;
  lng: number;
};

const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];

const pinIcon = L.divIcon({
  className: "robonaut-map-pin",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#111;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapClickHandler({
  onPick,
}: {
  onPick: (coords: MapCoordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

type LocationMapPickerProps = {
  value: MapCoordinates | null;
  onChange: (coords: MapCoordinates) => void;
};

export function LocationMapPicker({ value, onChange }: LocationMapPickerProps) {
  const center = useMemo<[number, number]>(
    () => (value ? [value.lat, value.lng] : DHAKA_CENTER),
    [value],
  );

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Tap the map to drop a pin. Optional — you can still type the address
        above.
      </div>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="z-0 h-64 w-full sm:h-80"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onChange} />
        {value ? (
          <Marker position={[value.lat, value.lng]} icon={pinIcon} />
        ) : null}
      </MapContainer>
      {value ? (
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
          Pinned: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      ) : (
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
          No pin selected yet.
        </p>
      )}
    </div>
  );
}
