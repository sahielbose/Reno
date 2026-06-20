import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Bid requests"
        subtitle="Send one scope to many subs and compare."
      />
      <ComingSoon title="Bid requests" note="Built in Phase 16." />
    </>
  );
}
