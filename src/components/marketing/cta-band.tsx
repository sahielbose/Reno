import { ButtonLink } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="mx-5">
      <div className="bg-ink relative mx-auto max-w-[var(--maxw)] overflow-hidden rounded-[28px] px-6 py-20 text-center text-white">
        <div
          aria-hidden="true"
          className="absolute top-[30%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(245,165,36,.18),transparent_60%)]"
        />
        <h2 className="relative text-[clamp(2.2rem,5vw,3.4rem)] font-bold">
          From bid to built,
          <br />
          <span className="text-text-3">in one place.</span>
        </h2>
        <p className="relative mx-auto mt-[1.1rem] mb-8 max-w-[440px] text-[rgba(255,255,255,.7)]">
          Join contractors who&apos;ve put away the spreadsheets and sticky
          notes for good.
        </p>
        <div className="relative flex flex-wrap justify-center gap-[.7rem]">
          <ButtonLink href="/app/dashboard" variant="primary">
            Get started →
          </ButtonLink>
          <ButtonLink href="/app/projects/p1" variant="ghostOnDark">
            Open a live project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
