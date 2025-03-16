"use server";

import { refreshAccessToken } from "./refreshAccessToken";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${newAccessToken}`,
          ...(options.headers || {}),
        },
      });
    }
  }

  const data = await response.json();
  return data.payload || data;
}
