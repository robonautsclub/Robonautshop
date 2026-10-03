export type ResolvedDeliveryAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  path?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  district?: string;
  quarter?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

function firstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => Boolean(value?.trim()));
}

function joinParts(...values: Array<string | undefined>): string | undefined {
  const parts = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(", ") : undefined;
}

/**
 * Map OpenStreetMap Nominatim reverse-geocode data into checkout form fields.
 */
export function mapNominatimToDeliveryAddress(
  data: NominatimReverseResponse,
): ResolvedDeliveryAddress | null {
  const address = data.address;
  if (!address && !data.display_name) {
    return null;
  }

  const road =
    firstDefined(address?.road, address?.pedestrian, address?.path) ??
    undefined;

  const addressLine1 =
    joinParts(address?.house_number, road) ||
    firstDefined(
      address?.neighbourhood,
      address?.suburb,
      address?.quarter,
      data.display_name?.split(",")[0],
    ) ||
    "";

  const addressLine2 = firstDefined(
    address?.suburb !== road ? address?.suburb : undefined,
    address?.neighbourhood !== addressLine1 ? address?.neighbourhood : undefined,
    address?.quarter,
    address?.city_district,
    address?.district,
  );

  const city =
    firstDefined(
      address?.city,
      address?.town,
      address?.village,
      address?.municipality,
      address?.state_district,
      address?.county,
      address?.state,
    ) || "";

  const rawPostcode = address?.postcode?.trim();
  const postalDigits = rawPostcode?.replace(/\D/g, "") ?? "";
  const postalCode =
    postalDigits.length >= 4 ? postalDigits.slice(0, 4) : undefined;

  if (!addressLine1 && !city) {
    return null;
  }

  return {
    addressLine1: addressLine1 || city,
    addressLine2,
    city: city || "Dhaka",
    postalCode,
  };
}

export async function reverseGeocodeDeliveryAddress(
  lat: number,
  lng: number,
): Promise<ResolvedDeliveryAddress | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimReverseResponse;
  return mapNominatimToDeliveryAddress(data);
}
