import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader title="Schedule" subtitle="Gantt with the critical path." />
      <ComingSoon title="Schedule" note="Built in Phase 15." />
    </>
  );
}
