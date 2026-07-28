import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { getEasyTAuthSecret } from "@/lib/easyt/auth-environment";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

function createAuth(databaseUrl: string, secret: string) {
  return betterAuth({
    appName: "EasyT",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    secret,
    database: new Pool({ connectionString: databaseUrl }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    socialProviders: googleEnabled ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    } : {},
    trustedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://shaunwhiting.com",
    ],
  });
}

type EasyTAuth = ReturnType<typeof createAuth>;
let authInstance: EasyTAuth | undefined;

export function getAuth(): EasyTAuth {
  if (authInstance) return authInstance;

  const databaseUrl = process.env.DATABASE_URL;
  const secret = getEasyTAuthSecret();
  if (!databaseUrl || !secret) {
    throw new Error("EasyT authentication is not configured in this environment.");
  }

  authInstance = createAuth(databaseUrl, secret);

  return authInstance;
}
