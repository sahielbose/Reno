import Link from "next/link";
import { RenoWordmark } from "@/components/brand/logo";

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-[14px]"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L6 22H2.9l7.5-8.6L2.5 2H9l4.5 6.6L18.9 2z" />
    </svg>
  );
}

/** A column of footer links (`.fc`). */
function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h5 className="font-display mb-4 text-[0.72rem] font-bold tracking-[0.1em] text-[rgba(255,255,255,.45)] uppercase">
        {title}
      </h5>
      <ul>{children}</ul>
    </div>
  );
}

/** A single footer link (`.fc a`). */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block py-[0.28rem] text-[0.9rem] text-[rgba(255,255,255,.72)] transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

/** The marketing site footer (dark, `footer` / `.fg` / `.fb` in the prototype). */
export function Footer() {
  return (
    <footer className="bg-ink px-5 pt-[60px] pb-7 text-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-[30px] md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div>
          <RenoWordmark
            className="mb-4 text-white"
            glyph="#ffffff"
            tile="var(--color-brand)"
          />
          <p className="max-w-[230px] text-[0.86rem] text-[rgba(255,255,255,.5)]">
            Construction management software for modern builders.
          </p>
          <div className="mt-4 flex gap-[0.6rem]">
            <Link
              href="#"
              aria-label="Reno on Facebook"
              className="hover:bg-brand grid size-8 place-items-center rounded-lg bg-[rgba(255,255,255,.07)] text-[rgba(255,255,255,.7)] transition-colors hover:text-white"
            >
              <FacebookIcon />
            </Link>
            <Link
              href="#"
              aria-label="Reno on X"
              className="hover:bg-brand grid size-8 place-items-center rounded-lg bg-[rgba(255,255,255,.07)] text-[rgba(255,255,255,.7)] transition-colors hover:text-white"
            >
              <XIcon />
            </Link>
          </div>
        </div>

        <FooterColumn title="Who we serve">
          <FooterLink href="#serve">Home builders</FooterLink>
          <FooterLink href="#serve">Remodelers</FooterLink>
          <FooterLink href="#serve">Roofers</FooterLink>
          <FooterLink href="#serve">Commercial</FooterLink>
        </FooterColumn>

        <FooterColumn title="Platform">
          <FooterLink href="#f-ai">Features</FooterLink>
          <FooterLink href="#allfeat">All modules</FooterLink>
          <FooterLink href="/app/dashboard">Open the app</FooterLink>
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink href="#">About</FooterLink>
          <FooterLink href="#">Contact</FooterLink>
          <FooterLink href="/app/dashboard">Sign in</FooterLink>
        </FooterColumn>

        <FooterColumn title="Legal">
          <FooterLink href="#">Privacy</FooterLink>
          <FooterLink href="#">Terms</FooterLink>
        </FooterColumn>
      </div>

      <div className="mx-auto mt-9 max-w-[1180px] border-t border-[rgba(255,255,255,.1)] pt-[22px] text-center text-[0.82rem] text-[rgba(255,255,255,.4)]">
        © 2026 Reno. A functional UX study.
      </div>
    </footer>
  );
}
