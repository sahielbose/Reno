/** Public, passwordless surfaces (signer / pay / portal) - no app shell. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper min-h-screen px-4 py-10 sm:py-16">{children}</div>
  );
}
