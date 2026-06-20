import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader title="Contacts" subtitle="Clients, subs, and vendors." />
      <ComingSoon title="Contacts" note="Built in Phase 7." />
    </>
  );
}
