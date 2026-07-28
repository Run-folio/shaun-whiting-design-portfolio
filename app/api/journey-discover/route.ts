import { NextRequest, NextResponse } from "next/server";

type WikiPage = {
  pageid?: number;
  title?: string;
  extract?: string;
  thumbnail?: { source?: string };
  coordinates?: Array<{ lat?: number; lon?: number }>;
};

const irrelevant = /^(tourism|tourist attraction|visitor cent(?:er|re)|tourist gateway|tourist information|list of|travel|tour operator|tourism in|geography of|history of|economy of|line \d+|metro line|bus line)/i;
const nonVisitPage = /\b(district|municipality|administrative division|rapid transit line|metro line|population density|electoral district|neighbourhood of madrid)\b/i;

function visitorValue(page: WikiPage) {
  const text = `${page.title ?? ""} ${page.extract ?? ""}`;
  let score = page.thumbnail?.source ? 5 : 0;
  if (/museum|palace|cathedral|church|monastery|temple|castle|fortress|square|plaza|market|park|garden|gallery|theatre|theater|monument|tower|bridge|beach|mountain|lake|historic|landmark|unesco/i.test(text)) score += 6;
  if (/one of the (?:best known|most visited|most famous|oldest|largest)|major tourist|popular attraction|world heritage/i.test(text)) score += 5;
  if (nonVisitPage.test(text)) score -= 20;
  return score;
}

function classify(title: string, extract: string) {
  const text = `${title} ${extract}`.toLowerCase();
  if (/park|garden|mountain|beach|lake|forest|trail|viewpoint|hill/.test(text)) return { type: "Nature", tags: ["Nature"] };
  if (/market|food|restaurant|culinary/.test(text)) return { type: "Food", tags: ["Food"] };
  if (/museum|gallery|theatre|theater|cultural/.test(text)) return { type: "Culture", tags: ["Cities"] };
  return { type: "Landmark", tags: ["Cities"] };
}

export async function GET(request: NextRequest) {
  const destination = request.nextUrl.searchParams.get("destination")?.trim();
  const country = request.nextUrl.searchParams.get("country")?.trim();
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));
  if (!destination || destination.length > 120 || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ places: [] }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "geosearch",
      ggsnamespace: "0",
      ggscoord: `${latitude}|${longitude}`,
      ggsradius: "10000",
      ggslimit: "40",
      prop: "extracts|pageimages|coordinates",
      exintro: "1",
      explaintext: "1",
      piprop: "thumbnail",
      pithumbsize: "720",
      colimit: "max",
      origin: "*",
    });
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": "EasyT journey planner/1.0 (https://shaunwhiting.com)" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!response.ok) throw new Error("Wikipedia lookup failed");
    const data = await response.json() as { query?: { pages?: Record<string, WikiPage> } };
    const seen = new Set<string>();
    const places = Object.values(data.query?.pages ?? {})
      .filter((page) => {
        const coordinate = page.coordinates?.[0];
        const key = page.title?.toLowerCase() ?? "";
        return Boolean(page.title && page.extract && coordinate && !irrelevant.test(page.title) && !nonVisitPage.test(`${page.title} ${page.extract}`) && !seen.has(key) && seen.add(key));
      })
      .sort((a, b) => visitorValue(b) - visitorValue(a))
      .slice(0, 10)
      .map((page, index) => {
        const coordinate = page.coordinates![0];
        const category = classify(page.title!, page.extract!);
        return {
          id: `${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${page.pageid ?? index}`,
          title: page.title!,
          area: destination,
          type: category.type,
          tags: category.tags,
          cost: 0.5,
          description: `${page.extract!.slice(0, 190).replace(/\s+\S*$/, "")}…`,
          image: page.thumbnail?.source,
          sourceUrl: `https://en.wikipedia.org/?curid=${page.pageid}`,
          country: country || destination,
          coordinates: [coordinate.lon, coordinate.lat] as [number, number],
        };
      });
    return NextResponse.json({ places });
  } catch (error) {
    console.error("Journey discovery failed", error);
    return NextResponse.json({ places: [] });
  }
}
