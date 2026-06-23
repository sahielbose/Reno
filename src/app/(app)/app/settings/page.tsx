import { db } from "@/lib/db";
import { getOrgContext, hasRole } from "@/lib/auth";
import { PageHeader } from "@/components/app/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AiKeyForm,
  type AiStatus,
} from "@/components/app/settings/ai-key-form";

function maskKey(key: string): string {
  return `sk-ant-…${key.slice(-4)}`;
}

export default async function SettingsPage() {
  const { orgId, role } = await getOrgContext();
  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { name: true, aiApiKey: true, aiModel: true },
  });

  const hasOrgKey = Boolean(org?.aiApiKey);
  const hasEnvKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const status: AiStatus = {
    connected: hasOrgKey || hasEnvKey,
    source: hasOrgKey ? "org" : hasEnvKey ? "env" : "none",
    keyHint: hasOrgKey ? maskKey(org!.aiApiKey!) : null,
    model: org?.aiModel ?? "claude-opus-4-8",
    canEdit: hasRole(role, "ADMIN"),
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Workspace, team, and integrations."
      />
      <div className="grid max-w-2xl gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-2">Name</span>
              <span className="font-medium">{org?.name ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-2">Your role</span>
              <Badge variant="neutral">{role}</Badge>
            </div>
          </CardContent>
        </Card>

        <AiKeyForm status={status} />
      </div>
    </>
  );
}
