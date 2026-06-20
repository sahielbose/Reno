import { AppShell } from "@/components/app/shell/app-shell";

/** Authenticated app shell — wraps every /app/* route in the sidebar + topbar
 *  frame. Auth gating is added with the dev provider in Phase 6. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
