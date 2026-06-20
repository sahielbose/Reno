import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Company, team, integrations, billing."
      />
      <ComingSoon title="Settings" note="Built across later phases." />
    </>
  );
}
