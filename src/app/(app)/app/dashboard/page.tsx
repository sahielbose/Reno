import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Here is what needs your attention."
      />
      <ComingSoon title="Dashboard" note="Built in Phase 8." />
    </>
  );
}
