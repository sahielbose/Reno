import { ButtonLink } from "@/components/ui/button";
import { RenoWordmark } from "@/components/brand/logo";

/**
 * Placeholder landing — replaced by the full marketing site in Phase 4.
 * Every CTA opens the app (no pricing, no "book a demo").
 */
export default function LandingPage() {
  return (
    <main className="bg-ink relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_90%_70%_at_50%_30%,#000_30%,transparent_78%)] [background-size:46px_46px] opacity-50"
      />
      <div className="relative max-w-2xl">
        <RenoWordmark
          className="mb-8 justify-center"
          tile="#ffffff"
          glyph="var(--color-brand)"
          textClassName="text-white text-2xl"
        />
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Run every job from first bid to{" "}
          <span className="bg-brand rounded-[0.12em] px-[0.18em]">
            final build
          </span>
          .
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/75">
          Estimate, win, schedule, and get paid — one place for the whole job.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/app/dashboard" variant="primary">
            Get started
          </ButtonLink>
          <ButtonLink href="/app/projects" variant="ghostOnDark">
            Open a live project
          </ButtonLink>
        </div>
        <p className="mt-10 text-sm text-white/40">
          Full landing page lands in Phase 4.
        </p>
      </div>
    </main>
  );
}
