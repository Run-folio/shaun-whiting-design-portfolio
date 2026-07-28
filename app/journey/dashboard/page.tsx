import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { listTripsForOwner } from "@/lib/easyt/repository";
import EasyTNavigation from "../easyt-navigation";
import DashboardClient from "./dashboard-client";
import styles from "../account.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "My trips · EasyT" };

export default async function EasyTDashboardPage() {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    redirect("/journey/login?setup=required");
  }

  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/journey/login?next=/journey/dashboard");
  const trips = await listTripsForOwner(session.user.id);
  return <main className={styles.page}>
    <EasyTNavigation current="trips" />
    <section className={styles.dashboard}>
      <div className={styles.dashTop}>
        <div><p className={styles.eyebrow}>Your travel workspace</p><h1>My trips.</h1><p className={styles.userLine}>Signed in as {session.user.email}</p></div>
        <DashboardClient trips={trips} controlsOnly />
      </div>
      <DashboardClient trips={trips} />
    </section>
  </main>;
}
