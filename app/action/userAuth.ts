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

export async function userSignin(formData: FormData): Promise<any> {
  const cookieStore = await cookies(); // ✅ Await the cookies function

  try {
    // Extract email and password
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `Login failed with status: ${response.status}`
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid response from server.");
    }

    if (!data.success) {
      return {
        success: false,
        error: data.message || "Invalid login credentials.",
      };
    }

    // ✅ Set cookies only if the login is successful
    await cookieStore.set("accessToken", data.payload.accessToken, {
      secure: true,
      httpOnly: true,
      path: "/",
    });

    await cookieStore.set("userInfo", JSON.stringify(data.payload.user), {
      secure: true,
      path: "/",
    });

    return data;
  } catch (error: any) {
    console.error("Error from action:", error);
    return {
      success: false,
      error: error.message || "Something went wrong. Please try again.",
    };
  }
}

export async function userLogout() {
  (await cookies()).delete("accessToken");
  (await cookies()).delete("userInfo");
  redirect("/sign-in");
}
