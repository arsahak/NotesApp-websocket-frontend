"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function userSignUp(
  formData: FormData | Record<string, string>
): Promise<{ error?: string; ok: boolean; url?: string }> {
  const requiredFields = ["email", "password", "name"];

  let data: Record<string, string>;

  if (formData instanceof FormData) {
    // Convert FormData to a plain object
    data = Object.fromEntries(formData.entries()) as Record<string, string>;
  } else {
    // Assume it's already an object
    data = formData;
  }

  // Check for missing fields
  for (const field of requiredFields) {
    if (!data[field]) {
      return { error: `${field} is required.`, ok: false };
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("API URL is missing in environment variables.");
    return { error: "Internal error. Please try again later.", ok: false };
  }

  try {
    const response = await fetch(`${apiUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: responseData.error || "Failed to register. Please try again.",
        ok: false,
      };
    }

    return { ok: true, url: response.url };
  } catch (err) {
    console.error("Error during user sign-up:", err);
    return {
      error: "A network error occurred. Please try again later.",
      ok: false,
    };
  }
}

export async function userSignin(formData: FormData) {
  const cookieStore = await cookies();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.message };
    }

    await cookieStore.set("accessToken", data.payload.accessToken, {
      secure: true,
      httpOnly: true,
      path: "/",
    });

    await cookieStore.set("refreshToken", data.payload.refreshToken, {
      secure: true,
      httpOnly: true,
      path: "/",
    });

    return data;
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Login failed." };
  }
}

export async function userLogout() {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });

  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("userInfo");

  redirect("/sign-in");
}
