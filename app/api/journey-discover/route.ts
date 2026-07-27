import { NextRequest, NextResponse } from "next/server";

type WikiPage = {
  title?: string;
  extract?: string;
  thumbnail?: { source?: string };
  coordinates?: Array<{ lat?: number; lon?: number }>;
};
type BoundaryResult = { boundingbox?: [string, string, string, string] };

type Bounds = { south: number; north: number; west: number; east: number };

function inBounds(coordinates: WikiPage["coordinates"], bounds: Bounds | null) {
  if (!bounds) return true;
  const point = coordinates?.[0];
  if (typeof point?.lat !== "number" || typeof point.lon !== "number") return false;
  return point.lat >= bounds.south && point.lat <= bounds.north && point.lon >= bounds.west && point.lon <= bounds.east;
}

async function destinationBounds(destination: string): Promise<Bounds | null> {
  const params = new URLSearchParams({ q: destination, format: "jsonv2", limit: "1" });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": "Journey trip planner prototype" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  if (!response.ok) return null;
  const match = (await response.json() as BoundaryResult[])[0];
  const [south, north, west, east] = match?.boundingbox?.map(Number) ?? [];
  if (![south, north, west, east].every(Number.isFinite)) return null;
  return { south, north, west, east };
}

export async function GET(request: NextRequest) {
  const destination = request.nextUrl.searchParams.get("destination")?.trim();
  if (!destination || destination.length > 100) return NextResponse.json({ places: [] }, { status: 400 });

  try {
    const [bounds, response] = await Promise.all([
      destinationBounds(destination),
      fetch(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({
        action: "query", format: "json", generator: "search", gsrsearch: `${destination} landmarks attractions`, gsrnamespace: "0", gsrlimit: "20", prop: "extracts|pageimages|coordinates", exintro: "1", explaintext: "1", piprop: "thumbnail", pithumbsize: "520", colimit: "max", origin: "*",
      })}`, { next: { revalidate: 60 * 60 * 24 } }),
    ]);
    if (!response.ok) throw new Error("Wikipedia lookup failed");
    const data = await response.json() as { query?: { pages?: Record<string, WikiPage> } };
    const irrelevant = /^(tourism|tourist attraction|visitor center|tourist gateway|tourist information|list of tourist attractions|ip[eé]ru|travel|tour operator|tourism in)/i;
    const destinationNeedle = destination.toLocaleLowerCase();
    const seen = new Set<string>();
    const places = Object.values(data.query?.pages ?? {})
      .filter((page) => page.title && page.extract && !irrelevant.test(page.title) && `${page.title} ${page.extract}`.toLocaleLowerCase().includes(destinationNeedle) && inBounds(page.coordinates, bounds) && !seen.has(page.title.toLowerCase()) && Boolean(seen.add(page.title.toLowerCase())))
      .slice(0, 10)
      .map((page, index) => ({
        id: `${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
        title: page.title as string,
        area: destination,
        type: "Live discovery",
        duration: index < 2 ? "Half day" : "Flexible",
        description: `${(page.extract as string).slice(0, 180).replace(/\s+\S*$/, "")}…`,
        image: page.thumbnail?.source,
        country: destination,
      }));
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [] });
  }
}
