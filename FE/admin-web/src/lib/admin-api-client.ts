import { env } from "@/lib/env";

type AdminApiClientOptions = RequestInit & {
  accessToken?: string;
};

export async function adminApiClient<TResponse>(
  path: string,
  options: AdminApiClientOptions = {}
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
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
