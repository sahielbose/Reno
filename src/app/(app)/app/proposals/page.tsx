import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Proposals"
        subtitle="Branded agreements out for signature."
      />
      <ComingSoon title="Proposals" note="Built in Phase 11." />
    </>
  );
}
