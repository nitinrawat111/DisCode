/**
 * Custom fetch mutator used by the Orval-generated API client.
 * Reference: https://orval.dev/docs/guides/custom-client
 */

/** Storage key for the JWT access token returned at login. */
export const ACCESS_TOKEN_KEY = "accessToken";

export const customFetch = async <T>(
  url: string,
  { method = "GET", headers, body, ...options }: RequestInit = {},
): Promise<T> => {
  const requestHeaders = new Headers(headers);

  if (requestHeaders.has("Content-Type") === false) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (typeof token === "string") {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const baseURL = new URL(import.meta.env.VITE_API_BASE_URL);
  const targetURL = new URL(url, baseURL);

  const response = await fetch(targetURL.toString(), {
    ...options,
    method,
    headers: requestHeaders,
    body,
  });

  if (response.ok === false) {
    const errorBody = (await response.json()) as { message?: string } | null;
    const message =
      errorBody?.message ??
      `Request failed with status ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return await response.json();
};

export default customFetch;
