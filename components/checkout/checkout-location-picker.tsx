"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { MapCoordinates } from "@/components/checkout/location-map-picker";
import { Button } from "@/components/ui/button";
import {
  reverseGeocodeDeliveryAddress,
  type ResolvedDeliveryAddress,
} from "@/lib/checkout/reverse-geocode";

const LocationMapPicker = dynamic(
  () =>
    import("@/components/checkout/location-map-picker").then(
      (mod) => mod.LocationMapPicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl border text-sm text-muted-foreground sm:h-80">
        Loading map…
      </div>
    ),
  },
);

type CheckoutLocationPickerProps = {
  value: MapCoordinates | null;
  onChange: (coords: MapCoordinates | null) => void;
  onResolvedAddress?: (address: ResolvedDeliveryAddress) => void;
};

export function CheckoutLocationPicker({
  value,
  onChange,
  onResolvedAddress,
}: CheckoutLocationPickerProps) {
  const [open, setOpen] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handlePick(coords: MapCoordinates) {
    onChange(coords);
    setResolving(true);
    setLookupError(null);

    try {
      const resolved = await reverseGeocodeDeliveryAddress(
        coords.lat,
        coords.lng,
      );

      if (!resolved) {
        setLookupError(
          "Could not find a nearby street address for that pin. Please type it manually.",
        );
        return;
      }

      onResolvedAddress?.(resolved);
    } catch {
      setLookupError(
        "Address lookup failed. Your pin is saved — fill the fields manually if needed.",
      );
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Pin on map</p>
          <p className="text-sm text-muted-foreground">
            Tap the map to pin your delivery location. Road, area, city, and
            postal code fill in automatically when available.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? "Hide map" : "Open map"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                setLookupError(null);
              }}
            >
              Clear pin
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <LocationMapPicker value={value} onChange={handlePick} />
      ) : null}

      {resolving ? (
        <p className="text-xs text-muted-foreground">
          Filling delivery address from the map pin…
        </p>
      ) : null}

      {lookupError ? (
        <p className="text-xs text-destructive">{lookupError}</p>
      ) : null}
    </div>
  );
}
