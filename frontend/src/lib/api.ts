const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type TokenHolder = {
  token: string | null;
  refreshing: Promise<string | null> | null;
};

const holder: TokenHolder = { token: null, refreshing: null };

export function setAccessToken(token: string | null) {
  holder.token = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
  }
}

export function getAccessToken(): string | null {
  if (holder.token) return holder.token;
  if (typeof window !== "undefined") {
    holder.token = localStorage.getItem("access_token");
  }
  return holder.token;
}

async function refresh(): Promise<string | null> {
  if (holder.refreshing) return holder.refreshing;
  holder.refreshing = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      holder.refreshing = null;
    }
  })();
  return holder.refreshing;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const doFetch = async (token: string | null) => {
    const headers = new Headers(options.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${API_URL}/api${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let res = await doFetch(getAccessToken());
  if (res.status === 401) {
    const refreshed = await refresh();
    if (refreshed) res = await doFetch(refreshed);
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.message ?? text;
    } catch {
      /* noop */
    }
    throw new Error(Array.isArray(message) ? message.join(", ") : message || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
