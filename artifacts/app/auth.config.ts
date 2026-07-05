import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config shared by the middleware. It contains no database or
 * bcrypt access (those aren't allowed in the edge runtime) — only session
 * strategy, the sign-in page, and the route-protection rule. The Credentials
 * provider with its DB lookup lives in auth.ts, which runs in Node.
 */
export const authConfig = {
  // Trust the deployment host (Replit/other proxies) for callback URLs.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = nextUrl.pathname === "/admin/login";

      // Already signed in and visiting the login page → send to the dashboard.
      if (isLoginPage) {
        return isLoggedIn
          ? Response.redirect(new URL("/admin", nextUrl))
          : true;
      }

      // Every other /admin route requires a session.
      if (nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
