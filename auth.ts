import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    // secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing password.");
        }

        const { email, password } = credentials;

        if (!email || !password) {
          throw new Error("Both email and password are required.");
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          console.error("API URL is not defined in environment variables.");
          throw new Error("Internal server error. Please try again later.");
        }

        try {
          const response = await fetch(`${apiUrl}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const userResponse = await response.json();

          if (
            !userResponse ||
            !userResponse.payload ||
            !userResponse.payload.user
          ) {
            throw new Error("Invalid user data returned from the server.");
          }

          const { user, accessToken } = userResponse.payload;

          if (!user || !accessToken) {
            throw new Error("Missing required user information or token.");
          }

          return {
            ...user,
            accessToken,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(
              error.message || "An error occurred during authorization."
            );
          } else {
            throw new Error("An unknown error occurred during authorization.");
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      session.user = token as any;
      return session;
    },
  },
});
