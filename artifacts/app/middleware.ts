import NextAuth from "next-auth";

import { authConfig } from "./auth.config";

// Runs the edge-safe auth config's `authorized` callback to gate /admin routes.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
