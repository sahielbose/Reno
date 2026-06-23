"use client";

import { useState, useTransition } from "react";
import { Check, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { saveAiKeyAction, disconnectAiAction } from "@/server/actions/settings";

export type AiStatus = {
  connected: boolean;
  source: "org" | "env" | "none";
  keyHint: string | null;
  model: string;
  canEdit: boolean;
};

export function AiKeyForm({ status }: { status: AiStatus }) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(status.model);
  const [pending, startTransition] = useTransition();

  function save() {
    if (!apiKey.trim()) return toast.error("Paste your Anthropic key first.");
    startTransition(async () => {
      const res = await saveAiKeyAction({ apiKey: apiKey.trim(), model });
      if (res.ok) {
        toast.success("AI connected - the assistant now uses your key.");
        setApiKey("");
      } else {
        toast.error(res.error);
      }
    });
  }

  function disconnect() {
    startTransition(async () => {
      const res = await disconnectAiAction();
      if (res.ok) toast.success("Disconnected.");
      else toast.error(res.error);
    });
  }

  const statusBadge =
    status.source === "org" ? (
      <Badge variant="ok" dot>
        Connected
      </Badge>
    ) : status.source === "env" ? (
      <Badge variant="info" dot>
        Connected (shared key)
      </Badge>
    ) : (
      <Badge variant="amber" dot>
        Demo mode
      </Badge>
    );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="text-brand size-4" />
          AI assistant
        </CardTitle>
        {statusBadge}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-text-2 text-sm leading-relaxed">
          {status.source === "org" && (
            <>
              The assistant and every AI feature run on this workspace&apos;s
              Anthropic key
              {status.keyHint ? (
                <>
                  {" "}
                  (<code className="font-mono text-xs">{status.keyHint}</code>)
                </>
              ) : null}
              .
            </>
          )}
          {status.source === "env" && (
            <>
              AI is running on a shared <code>ANTHROPIC_API_KEY</code> from the
              environment. Add a key below to use your own for this workspace.
            </>
          )}
          {status.source === "none" && (
            <>
              Add your Anthropic API key to switch the assistant from canned
              demo answers to live Claude. One key powers all AI in Reno.
            </>
          )}
        </p>

        {status.canEdit ? (
          <>
            <Field label="Anthropic API key" htmlFor="ai-key">
              <Input
                id="ai-key"
                type="password"
                autoComplete="off"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </Field>
            <Field label="Model (optional)" htmlFor="ai-model">
              <Input
                id="ai-model"
                placeholder="claude-opus-4-8"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </Field>
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={save} disabled={pending}>
                <KeyRound className="size-4" />
                {status.source === "org" ? "Update key" : "Connect"}
              </Button>
              {status.source === "org" && (
                <Button variant="ghost" onClick={disconnect} disabled={pending}>
                  Disconnect
                </Button>
              )}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-text-3 hover:text-brand ml-auto text-xs underline"
              >
                Get a key
              </a>
            </div>
            <p className="text-text-3 flex items-center gap-1.5 text-xs">
              <Check className="size-3.5" />
              Stored against this workspace only and never shown in full again.
            </p>
          </>
        ) : (
          <p className="text-text-3 text-sm">
            Ask an admin or owner to change the AI key for this workspace.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
