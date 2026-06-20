/** Marketing (public) route group. The landing page brings its own nav and
 *  footer; this layout just scopes the group. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
