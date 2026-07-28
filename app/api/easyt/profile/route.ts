import { NextResponse } from "next/server";

import { requireEasyTOwner } from "@/lib/easyt/owner";
import { updateEasyTUserPreferences } from "@/lib/easyt/repository";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const owner = await requireEasyTOwner();
    const body = (await request.json()) as { language?: string };
    if (body.language !== "en" && body.language !== "es") {
      return NextResponse.json(
        { error: "Unsupported language." },
        { status: 400 },
      );
    }
    await updateEasyTUserPreferences(owner.id, { language: body.language });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update preferences.";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 },
    );
  }
}
