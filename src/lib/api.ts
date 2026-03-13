/**
 * API Client — central HTTP client for the MentorMeter backend.
 *
 * Replaces all direct Supabase SDK calls. Handles:
 *  - Base URL configuration
 *  - JWT token attachment
 *  - Automatic token refresh on 401
 *  - Typed helper methods (get, post, put, patch, delete)
 */

const API_URL = import.meta.env.VITE_API_URL || "https://mentor-meter-backend.onrender.com/";

// ── Token helpers ──────────────────────────────────────────────────

export const tokenStore = {
  getAccess: () => localStorage.getItem("access_token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  isLoggedIn: () => !!localStorage.getItem("access_token"),
};

// ── Core fetch wrapper ─────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = tokenStore.getAccess();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 and we have a refresh token, try refreshing once
  if (response.status === 401 && tokenStore.getRefresh()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      headers["Authorization"] = `Bearer ${tokenStore.getAccess()}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed — clear tokens and redirect to login
      tokenStore.clear();
      window.location.href = "/auth";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokenStore.getRefresh() }),
    });

    if (!resp.ok) return false;

    const data = await resp.json();
    tokenStore.set(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── Public API methods ─────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
