"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps the app with light/dark theme support. Thin wrapper around next-themes so
 * theming is handled in one place and the rest of the app stays framework-agnostic.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
