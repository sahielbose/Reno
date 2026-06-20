import { PageHeader } from "@/components/app/shell/page-header";
import { ComingSoon } from "@/components/app/shell/coming-soon";

export default async function ContactDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        title="Contact"
        subtitle={`Contact ${id}`}
        back={{ href: "/app/contacts", label: "All contacts" }}
      />
      <ComingSoon title="Contact detail" note="Built in Phase 7." />
    </>
  );
}
