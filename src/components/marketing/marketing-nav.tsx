"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { RenoWordmark } from "@/components/brand/logo";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-[18px] py-[14px]">
      <div
        className={`flex w-full max-w-[1180px] items-center justify-between gap-4 rounded-full border py-[0.55rem] pr-[0.6rem] pl-4 transition-[background-color,box-shadow,border-color] duration-[250ms] ${
          scrolled
            ? "border-line shadow-card bg-white/[0.88] backdrop-blur-[14px]"
            : "border-transparent"
        }`}
      >
        <Link
          href="#"
          aria-label="Reno home"
          className="flex flex-none items-center"
        >
          <RenoWordmark textClassName={scrolled ? "text-ink" : "text-white"} />
        </Link>

        <div className="hidden items-center gap-[0.3rem] md:flex">
          <Link
            href="#f-ai"
            className={`rounded-full px-[0.8rem] py-2 text-[0.95rem] font-medium transition-colors hover:bg-white/10 ${
              scrolled ? "text-text-2 hover:bg-paper" : "text-white/90"
            }`}
          >
            Features
          </Link>
          <Link
            href="#serve"
            className={`rounded-full px-[0.8rem] py-2 text-[0.95rem] font-medium transition-colors hover:bg-white/10 ${
              scrolled ? "text-text-2 hover:bg-paper" : "text-white/90"
            }`}
          >
            Who we serve
          </Link>
          <Link
            href="#allfeat"
            className={`rounded-full px-[0.8rem] py-2 text-[0.95rem] font-medium transition-colors hover:bg-white/10 ${
              scrolled ? "text-text-2 hover:bg-paper" : "text-white/90"
            }`}
          >
            Platform
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ButtonLink
            href="/app/dashboard"
            variant="link"
            className={`no-underline hover:no-underline ${
              scrolled ? "text-ink" : "text-white"
            }`}
          >
            Log in
          </ButtonLink>
          <ButtonLink href="/app/dashboard" variant="primary">
            Get started
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </nav>
  );
}
