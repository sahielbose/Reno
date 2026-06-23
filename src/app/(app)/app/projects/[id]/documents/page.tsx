import { getOrgContext, can } from "@/lib/auth";
import { listDocuments } from "@/server/repositories/document";
import { FilesView } from "@/components/app/documents/files-view";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId, role } = await getOrgContext();
  const docs = await listDocuments(orgId, id);
  const files = docs.map((d) => ({
    id: d.id,
    name: d.name,
    kind: d.kind,
    contentType: d.contentType,
    size: d.size,
    createdAt: d.createdAt,
  }));

  return (
    <FilesView
      projectId={id}
      files={files}
      canDelete={can(role, "contact.delete")}
    />
  );
}
