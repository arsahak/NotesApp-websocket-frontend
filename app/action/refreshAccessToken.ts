"use server";
import { cookies } from "next/headers";

export async function refreshAccessToken() {
  try {
    // Await the cookies() call and then get the refreshToken
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      throw new Error("Refresh token missing. Please log in again.");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }), // Send refresh token in request body
      }
    );

    if (!response.ok) {
      throw new Error("Failed to refresh token. Please log in again.");
    }

    const data = await response.json();
    return data.payload.accessToken; // Ensure backend sends accessToken inside payload
  } catch (error) {
    console.error("Refresh token error:", error);
    return null;
  }
}
