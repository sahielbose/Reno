import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Client finances, synced to your books."
      />
      <ComingSoon title="Invoices" note="Built in Phase 16." />
    </>
  );
}
