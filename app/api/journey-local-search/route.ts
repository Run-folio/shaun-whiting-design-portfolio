import { NextRequest, NextResponse } from "next/server";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type LocalPlace = {
  id: string;
  name: string;
  address: string;
  category: string;
  coordinates: [number, number];
  mapsUrl: string;
  bookingUrl: string | undefined;
};

function addressFor(tags: Record<string, string>, fallback: string) {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const locality = tags["addr:city"] || tags["addr:district"] || tags["addr:suburb"];
  return [street, locality, tags["addr:postcode"], fallback].filter(Boolean).join(", ");
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  const country = request.nextUrl.searchParams.get("country")?.trim();
  const kind = request.nextUrl.searchParams.get("kind") === "stay" ? "stay" : "restaurant";
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));
  if (!city || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return NextResponse.json({ places: [] }, { status: 400 });
  }

  const radius = kind === "stay" ? 7500 : 5000;
  const matcher = kind === "stay"
    ? '["tourism"~"^(hotel|hostel|guest_house|motel)$"]'
    : '["amenity"~"^(restaurant|cafe|fast_food)$"]';
  const query = `[out:json][timeout:18];nwr(around:${radius},${latitude},${longitude})${matcher}["name"];out center tags 35;`;

  try {
    // The Kumi mirror accepts a simple GET and has proved more reliable than the
    // main Overpass endpoint for browser-originated prototype requests.
    const response = await fetch(`https://overpass.kumi.systems/api/interpreter?${new URLSearchParams({ data: query })}`, {
      headers: { "User-Agent": "Journey local venue finder (portfolio prototype)" },
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!response.ok) throw new Error("Local venue lookup unavailable");
    const data = await response.json() as { elements?: OverpassElement[] };
    const seen = new Set<string>();
    const places = (data.elements ?? [])
      .map((place) => {
        const tags = place.tags ?? {};
        const lat = place.lat ?? place.center?.lat;
        const lon = place.lon ?? place.center?.lon;
        const name = tags.name?.trim();
        if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        const address = addressFor(tags, country ? `${city}, ${country}` : city);
        const searchQuery = `${name}, ${address}`;
        const china = /china/i.test(country ?? "");
        return {
          id: `${place.id}`,
          name,
          address,
          category: tags.cuisine || tags.tourism || tags.amenity || kind,
          coordinates: [lon!, lat!] as [number, number],
          mapsUrl: china
            ? `https://www.amap.com/search?query=${encodeURIComponent(searchQuery)}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`,
          bookingUrl: kind === "stay" ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchQuery)}` : undefined,
        } satisfies LocalPlace;
      })
      .filter((place): place is LocalPlace => place !== null)
      .filter((place) => {
        const key = `${place.name}|${place.address}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
    return NextResponse.json({ places, source: "OpenStreetMap" });
  } catch {
    return NextResponse.json({ places: [] });
  }
}
