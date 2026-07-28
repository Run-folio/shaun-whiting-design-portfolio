import "server-only";

import { getEasyTDatabase } from "./database";
import { EasyTTrip, isEasyTTrip } from "./trip";

type TripDocumentRow = { document: unknown };

export async function ensureEasyTUser(ownerId: string, email: string, name?: string | null) {
  const sql = getEasyTDatabase();
  await sql`
    insert into easyt_users (id, email, name)
    values (${ownerId}, ${email}, ${name ?? null})
    on conflict (id) do update set
      email = excluded.email,
      name = coalesce(excluded.name, easyt_users.name),
      updated_at = now()
  `;
}

export async function listTripsForOwner(ownerId: string): Promise<EasyTTrip[]> {
  const sql = getEasyTDatabase();
  const rows = await sql`
    select document
    from easyt_trips
    where owner_id = ${ownerId} and deleted_at is null
    order by updated_at desc
  ` as TripDocumentRow[];
  return rows.map((row) => row.document).filter(isEasyTTrip);
}

export async function getTripForOwner(ownerId: string, tripId: string): Promise<EasyTTrip | null> {
  const sql = getEasyTDatabase();
  const rows = await sql`
    select document
    from easyt_trips
    where id = ${tripId} and owner_id = ${ownerId} and deleted_at is null
    limit 1
  ` as TripDocumentRow[];
  return rows[0] && isEasyTTrip(rows[0].document) ? rows[0].document : null;
}

export async function saveTripForOwner(ownerId: string, trip: EasyTTrip): Promise<EasyTTrip> {
  const sql = getEasyTDatabase();
  const ownership = await sql`select owner_id from easyt_trips where id = ${trip.id} limit 1` as Array<{ owner_id: string }>;
  if (ownership[0] && ownership[0].owner_id !== ownerId) throw new Error("Trip ownership mismatch.");

  const document: EasyTTrip = { ...trip, ownerId, updatedAt: new Date().toISOString() };
  await sql.transaction((tx) => [
    tx`
      insert into easyt_trips (
        id, owner_id, title, start_date, end_date, travellers, status,
        pace, currency, brief, document, schema_version, created_at, updated_at, deleted_at
      ) values (
        ${document.id}, ${ownerId}, ${document.title}, ${document.startDate}, ${document.endDate},
        ${document.travellers}, ${document.status}, ${document.brief.pace}, ${document.currency},
        ${JSON.stringify(document.brief)}, ${JSON.stringify(document)}, ${document.schemaVersion},
        ${document.createdAt}, ${document.updatedAt}, null
      )
      on conflict (id) do update set
        title = excluded.title,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        travellers = excluded.travellers,
        status = excluded.status,
        pace = excluded.pace,
        currency = excluded.currency,
        brief = excluded.brief,
        document = excluded.document,
        schema_version = excluded.schema_version,
        updated_at = excluded.updated_at,
        deleted_at = null
      where easyt_trips.owner_id = ${ownerId}
    `,
    tx`delete from easyt_recommendations where trip_id = ${document.id}`,
    tx`delete from easyt_plan_items where trip_id = ${document.id}`,
    tx`delete from easyt_legs where trip_id = ${document.id}`,
    tx`delete from easyt_stops where trip_id = ${document.id}`,
    ...document.stops.map((stop) => tx`
      insert into easyt_stops (
        id, trip_id, stop_order, name, country, latitude, longitude,
        arrival_date, departure_date, nights
      ) values (
        ${stop.id}, ${document.id}, ${stop.order}, ${stop.name}, ${stop.country},
        ${stop.latitude}, ${stop.longitude}, ${stop.arrivalDate}, ${stop.departureDate}, ${stop.nights}
      )
    `),
    ...document.legs.map((leg) => tx`
      insert into easyt_legs (
        id, trip_id, from_stop_id, to_stop_id, mode, distance_km,
        duration_minutes, provider, route_metadata
      ) values (
        ${leg.id}, ${document.id}, ${leg.fromStopId}, ${leg.toStopId}, ${leg.mode},
        ${leg.distanceKm}, ${leg.durationMinutes}, ${leg.provider}, ${JSON.stringify(leg.routeMetadata)}
      )
    `),
    ...document.planItems.map((item) => tx`
      insert into easyt_plan_items (
        id, trip_id, stop_id, day_number, plan_date, item_type, title,
        reason, notes, starts_at, ends_at, booking_url, latitude, longitude
      ) values (
        ${item.id}, ${document.id}, ${item.stopId}, ${item.dayNumber}, ${item.date},
        ${item.type}, ${item.title}, ${item.reason}, ${JSON.stringify(item.notes)},
        ${item.startsAt}, ${item.endsAt}, ${item.bookingUrl}, ${item.latitude}, ${item.longitude}
      )
    `),
    ...document.recommendations.map((recommendation) => tx`
      insert into easyt_recommendations (
        id, trip_id, rule, severity, message, proposed_change, status
      ) values (
        ${recommendation.id}, ${document.id}, ${recommendation.rule}, ${recommendation.severity},
        ${recommendation.message}, ${JSON.stringify(recommendation.proposedChange)}, ${recommendation.status}
      )
    `),
  ]);
  return document;
}

export async function archiveTripForOwner(ownerId: string, tripId: string) {
  const sql = getEasyTDatabase();
  await sql`
    update easyt_trips
    set status = 'archived', updated_at = now(),
      document = jsonb_set(document, '{status}', '"archived"'::jsonb, true)
    where id = ${tripId} and owner_id = ${ownerId} and deleted_at is null
  `;
}

export async function deleteTripForOwner(ownerId: string, tripId: string) {
  const sql = getEasyTDatabase();
  await sql`
    update easyt_trips
    set deleted_at = now(), updated_at = now()
    where id = ${tripId} and owner_id = ${ownerId} and deleted_at is null
  `;
}
