import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Cost catalog"
        subtitle="Reusable cost codes behind every budget."
      />
      <ComingSoon title="Cost catalog" note="Built in Phase 10." />
    </>
  );
}
