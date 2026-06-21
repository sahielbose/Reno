import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { FeatureAI } from "@/components/marketing/feature-ai";
import { FeatureTakeoff } from "@/components/marketing/feature-takeoff";
import { FeatureBudgetProposal } from "@/components/marketing/feature-budget-proposal";
import { FeatureEsign } from "@/components/marketing/feature-esign";
import { FeatureInvoice } from "@/components/marketing/feature-invoice";
import { FeatureSchedule } from "@/components/marketing/feature-schedule";
import { FeatureFilesRfi } from "@/components/marketing/feature-files-rfi";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { WhoWeServe } from "@/components/marketing/who-we-serve";
import { CtaBand } from "@/components/marketing/cta-band";
import { Footer } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <>
      <a
        href="#main-content"
        className="bg-brand sr-only rounded-full px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <MarketingNav />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <FeatureAI />
        <FeatureTakeoff />
        <FeatureBudgetProposal />
        <FeatureEsign />
        <FeatureInvoice />
        <FeatureSchedule />
        <FeatureFilesRfi />
        <FeatureGrid />
        <WhoWeServe />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
