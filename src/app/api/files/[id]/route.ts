import { getOrgContext } from "@/lib/auth";
import { getDocument } from "@/server/repositories/document";
import { getStorage } from "@/lib/storage/local";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const doc = await getDocument(orgId, id);
  if (!doc) return new Response("Not found", { status: 404 });

  const data = await getStorage().get(doc.fileKey);
  if (!data) return new Response("File missing", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${doc.name}"`,
    },
  });
}
