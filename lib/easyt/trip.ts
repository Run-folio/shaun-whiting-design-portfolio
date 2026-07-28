export const EASYT_TRIP_SCHEMA_VERSION = 1 as const;

export type TripStatus = "draft" | "planned" | "archived";
export type TripPace = "slow" | "full";
export type HotelChanges = "few" | "some";
export type BudgetBand = "value" | "mid" | "high";

export type TripStop = {
  id: string;
  order: number;
  name: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  nights: number | null;
};

export type TripLeg = {
  id: string;
  fromStopId: string;
  toStopId: string;
  mode: "flight" | "train" | "road" | "ferry" | "walk" | "unknown";
  distanceKm: number | null;
  durationMinutes: number | null;
  provider: string | null;
  routeMetadata: Record<string, unknown>;
};

export type PlanItem = {
  id: string;
  stopId: string;
  dayNumber: number;
  date: string;
  type: "arrival" | "activity" | "food" | "stay" | "transport" | "open";
  title: string;
  reason: string;
  notes: string[];
  startsAt: string | null;
  endsAt: string | null;
  bookingUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type TripRecommendation = {
  id: string;
  rule: string;
  severity: "info" | "warning" | "critical";
  message: string;
  proposedChange: Record<string, unknown> | null;
  status: "open" | "applied" | "dismissed";
};

export type TripBrief = {
  origin: string;
  mustDo: string;
  pace: TripPace;
  hotelChanges: HotelChanges;
  budgetBand: BudgetBand;
  selectedPlaces: Record<string, string[]>;
};

export type EasyTTrip = {
  schemaVersion: typeof EASYT_TRIP_SCHEMA_VERSION;
  id: string;
  ownerId: string | null;
  title: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  travellers: number;
  currency: string;
  brief: TripBrief;
  stops: TripStop[];
  legs: TripLeg[];
  planItems: PlanItem[];
  recommendations: TripRecommendation[];
  createdAt: string;
  updatedAt: string;
};

export type BuilderDay = {
  number: string;
  date: string;
  destination: string;
  title: string;
  reason: string;
  items: string[];
};

export type BuilderTripInput = {
  id: string;
  origin: string;
  stops: Array<{ id: string; name: string; country: string }>;
  startDate: string;
  endDate: string;
  picks: Record<string, string[]>;
  mustDo: string;
  pace: TripPace;
  hotels: HotelChanges;
  budget: BudgetBand;
  draft: BuilderDay[];
  createdAt?: string;
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function tripFromBuilder(input: BuilderTripInput): EasyTTrip {
  const now = new Date().toISOString();
  const stops = input.stops.map((stop, order) => ({
    ...stop,
    order,
    latitude: null,
    longitude: null,
    arrivalDate: null,
    departureDate: null,
    nights: null,
  }));

  const stopByName = new Map(stops.map((stop) => [stop.name, stop]));
  const planItems = input.draft.map((day, index): PlanItem => {
    const stop = stopByName.get(day.destination) ?? stops[0];
    const date = new Date(`${input.startDate}T00:00:00`);
    date.setDate(date.getDate() + index);
    return {
      id: `${input.id}-day-${index + 1}-${slug(day.title) || "plan"}`,
      stopId: stop?.id ?? "unassigned",
      dayNumber: index + 1,
      date: date.toISOString().slice(0, 10),
      type: day.title.toLowerCase().startsWith("arrive") ? "arrival" : day.title.toLowerCase().includes("open") ? "open" : "activity",
      title: day.title,
      reason: day.reason,
      notes: day.items,
      startsAt: null,
      endsAt: null,
      bookingUrl: null,
      latitude: null,
      longitude: null,
    };
  });

  return {
    schemaVersion: EASYT_TRIP_SCHEMA_VERSION,
    id: input.id,
    ownerId: null,
    title: `${input.origin} to ${stops.map((stop) => stop.name).join(" & ")}`,
    status: "draft",
    startDate: input.startDate,
    endDate: input.endDate,
    travellers: 2,
    currency: "GBP",
    brief: {
      origin: input.origin,
      mustDo: input.mustDo,
      pace: input.pace,
      hotelChanges: input.hotels,
      budgetBand: input.budget,
      selectedPlaces: input.picks,
    },
    stops,
    legs: stops.slice(1).map((stop, index) => ({
      id: `${input.id}-leg-${index + 1}`,
      fromStopId: stops[index].id,
      toStopId: stop.id,
      mode: "unknown",
      distanceKm: null,
      durationMinutes: null,
      provider: null,
      routeMetadata: {},
    })),
    planItems,
    recommendations: [],
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
}

export function isEasyTTrip(value: unknown): value is EasyTTrip {
  if (!value || typeof value !== "object") return false;
  const trip = value as Partial<EasyTTrip>;
  return trip.schemaVersion === EASYT_TRIP_SCHEMA_VERSION
    && typeof trip.id === "string"
    && typeof trip.startDate === "string"
    && typeof trip.endDate === "string"
    && Array.isArray(trip.stops)
    && Array.isArray(trip.planItems);
}
