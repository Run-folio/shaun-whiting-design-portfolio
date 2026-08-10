import { NextResponse } from "next/server";
import { recommendRouteFamilies, routeFamilies, type RouteInterest, type RouteRegion } from "@/lib/easyt/route-catalog";

export const dynamic = "force-dynamic";

const regions = new Set<RouteRegion>(["asia", "europe", "south-america", "central-america", "north-america", "africa"]);
const interests = new Set<RouteInterest>(["food", "culture", "nature", "rail", "coast", "hiking", "wildlife", "heritage"]);

export function GET(request: Request) {
  const url = new URL(request.url);
  const region = regions.has(url.searchParams.get("region") as RouteRegion) ? url.searchParams.get("region") as RouteRegion : undefined;
  const requestedInterests = url.searchParams.getAll("interest").filter((value): value is RouteInterest => interests.has(value as RouteInterest));
  const daysValue = Number(url.searchParams.get("days"));
  const days = Number.isFinite(daysValue) && daysValue > 0 ? daysValue : undefined;
  const input = { region, interests: requestedInterests, days };
  const routes = region || requestedInterests.length || days ? recommendRouteFamilies(input) : routeFamilies;
  return NextResponse.json({ routes, applied: input }, { headers: { "cache-control": "public, max-age=300, stale-while-revalidate=3600" } });
}
