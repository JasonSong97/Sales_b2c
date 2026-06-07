import { env } from "@/lib/env";

type AdminApiClientOptions = RequestInit & {
  accessToken?: string | null;
};

let adminAccessToken: string | null = null;

export function setAdminApiAccessToken(accessToken: string | null) {
  adminAccessToken = accessToken;
}

export function clearAdminApiAccessToken() {
  adminAccessToken = null;
}

export async function adminApiClient<TResponse>(
  path: string,
  options: AdminApiClientOptions = {}
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const accessToken = options.accessToken ?? adminAccessToken;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${env.apiUrl}/admin/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
