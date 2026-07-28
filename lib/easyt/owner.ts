import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ensureEasyTUser } from "./repository";

export type EasyTOwner = {
  id: string;
  email: string;
  name: string | null;
};

export async function requireEasyTOwner(): Promise<EasyTOwner> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || !session.user.email) throw new Error("Unauthorized");
  const owner = { id: session.user.id, email: session.user.email, name: session.user.name ?? null };
  await ensureEasyTUser(owner.id, owner.email, owner.name);
  return owner;
}
