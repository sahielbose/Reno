import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default function Page() {
  return (
    <>
      <PageHeader
        title="AI assistant"
        subtitle="Ask about any project, invoice, deadline."
      />
      <ComingSoon title="AI assistant" note="Built in Phase 17." />
    </>
  );
}
