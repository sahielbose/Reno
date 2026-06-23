import { requireSession } from "@/lib/auth";
import { listRequests } from "@/server/repositories/request";
import { RequestsView } from "@/components/app/requests/requests-view";

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const requests = await listRequests(session.org.id, id);

  return (
    <RequestsView
      projectId={id}
      requests={requests}
      currentUserName={session.user.name}
    />
  );
}
