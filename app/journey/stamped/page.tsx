import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { ensureEasyTUser, getEasyTUserPreferences } from "@/lib/easyt/repository";
import { isEasyTAuthConfigured } from "@/lib/easyt/auth-environment";
import EasyTNavigation from "../easyt-navigation";
import StampedClient from "./stamped-client";
import styles from "./stamped.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stamped · EasyT" };

export default async function StampedPage() {
  if (!isEasyTAuthConfigured()) redirect("/journey/login?setup=required");
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/journey/login?next=/journey/stamped");
  await ensureEasyTUser(session.user.id, session.user.email, session.user.name);
  const preferences = await getEasyTUserPreferences(session.user.id);

  return (
    <main className={styles.page}>
      <EasyTNavigation
        current="stamped"
        account={{ name: session.user.name, email: session.user.email, language: preferences?.language }}
      />
      <StampedClient userKey={session.user.id} />
    </main>
  );
}
