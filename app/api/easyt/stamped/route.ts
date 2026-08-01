import { NextResponse } from "next/server";
import { requireEasyTOwner } from "@/lib/easyt/owner";
import { getCountryStamps, setCountryStamp } from "@/lib/easyt/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireEasyTOwner();
    const rows = await getCountryStamps(owner.id);
    return NextResponse.json({
      statuses: Object.fromEntries(rows.map((row) => [row.countryId, row.status])),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load stamps.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const owner = await requireEasyTOwner();
    const body = (await request.json()) as { countryId?: string; status?: string | null };
    if (!body.countryId || (body.status !== null && body.status !== "visited" && body.status !== "want")) {
      return NextResponse.json({ error: "Invalid country stamp." }, { status: 400 });
    }
    await setCountryStamp(owner.id, body.countryId, body.status as "visited" | "want" | null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save stamp.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
