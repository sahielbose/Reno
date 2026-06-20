"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App theme provider. Reno is a light-first product (its dark surfaces — hero,
 * sidebar — are styled explicitly, not via a theme), so we default to light
 * and keep the provider available for a future dark mode.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
