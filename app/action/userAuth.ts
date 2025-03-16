"use server";

import { signIn, signOut } from "@/auth";

export async function userLogOut(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
export async function doCredentialLogin(formData: FormData): Promise<any> {
  try {
    const response = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
    return response;
  } catch (err: unknown) {
    throw new Error((err as Error).message || "Unknown error occurred");
  }
}

export async function doGoogleLogin(): Promise<any> {
  try {
    const response = await signIn("google", {
      redirect: false, // Set to true if you want to redirect to the default callback page
    });
    return response;
  } catch (err: unknown) {
    throw new Error((err as Error).message || "Google sign-in failed");
  }
}

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
