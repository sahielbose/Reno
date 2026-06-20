import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Purchase orders"
        subtitle="Send POs and track ordered vs delivered."
      />
      <ComingSoon title="Purchase orders" note="Built in Phase 16." />
    </>
  );
}
