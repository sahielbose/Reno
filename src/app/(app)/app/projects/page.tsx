import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader title="Projects" subtitle="Every job, from lead to closed." />
      <ComingSoon title="Projects" note="Built in Phase 8." />
    </>
  );
}
