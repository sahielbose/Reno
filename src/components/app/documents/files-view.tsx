"use client";

import * as React from "react";
import { FileText, FolderOpen, Image as ImageIcon, Trash2 } from "lucide-react";

import {
  uploadDocumentAction,
  deleteDocumentAction,
} from "@/server/actions/document";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** A document attached to a project. */
export type FileItem = {
  id: string;
  name: string;
  kind: "PLAN" | "PERMIT" | "PHOTO" | "CONTRACT" | "INSURANCE" | "OTHER";
  contentType: string | null;
  size: number | null;
  createdAt: Date;
};

const FILE_KINDS = [
  "PLAN",
  "PERMIT",
  "PHOTO",
  "CONTRACT",
  "INSURANCE",
  "OTHER",
] as const satisfies readonly FileItem["kind"][];

const KIND_BADGE: Record<
  FileItem["kind"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  PLAN: "brand",
  PERMIT: "amber",
  INSURANCE: "info",
  PHOTO: "purple",
  CONTRACT: "ok",
  OTHER: "neutral",
};

/** Whether a content type is an image we can render inline. */
function isImage(contentType: string | null): boolean {
  return !!contentType && contentType.startsWith("image/");
}

/** Whether a content type is a PDF we can preview in an iframe. */
function isPdf(contentType: string | null): boolean {
  return !!contentType && contentType.includes("pdf");
}

/** Human-readable byte size, e.g. "1.2 MB". */
function formatSize(bytes: number | null): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"] as const;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || Number.isInteger(value) ? 0 : 1)} ${units[unit]}`;
}

/**
 * Project Documents view: a "Files" card with an inline upload control (a
 * hidden file input fired by an Upload button, plus a kind selector) and a list
 * of uploaded files. PDFs and images preview in a Dialog; anything else opens
 * in a new tab.
 */
export function FilesView({
  projectId,
  files,
  canDelete,
}: {
  projectId: string;
  files: FileItem[];
  canDelete: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [kind, setKind] = React.useState<FileItem["kind"]>("OTHER");
  const [preview, setPreview] = React.useState<FileItem | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again re-fires onChange.
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    startTransition(async () => {
      const result = await uploadDocumentAction(projectId, formData);
      if (result.ok) {
        toast.success("Uploaded");
      } else {
        toast.error(result.error);
      }
    });
  }

  function onView(file: FileItem) {
    if (isPdf(file.contentType) || isImage(file.contentType)) {
      setPreview(file);
    } else {
      window.open(`/api/files/${file.id}`, "_blank", "noopener,noreferrer");
    }
  }

  function onDelete(file: FileItem) {
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteDocumentAction(projectId, file.id);
      if (result.ok) {
        toast.success("Deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  const selectClass = cn(
    "border-line text-foreground rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
    "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="file-kind">
              File type
            </label>
            <select
              id="file-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as FileItem["kind"])}
              disabled={isPending}
              className={selectClass}
              aria-label="File type"
            >
              {FILE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.charAt(0) + k.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={onPickFile}
              aria-hidden="true"
              tabIndex={-1}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
            >
              {isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
              <FolderOpen className="text-text-3 size-8" aria-hidden="true" />
              <p className="text-text-2 text-sm font-medium">
                No files yet - upload plans, permits, or photos.
              </p>
            </div>
          ) : (
            <ul className="divide-line divide-y">
              {files.map((file) => {
                const img = isImage(file.contentType);
                return (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-[9px] text-[0.6rem] font-bold",
                        img
                          ? "bg-[#f3e8ff] text-[#7e22ce]"
                          : "bg-brand-100 text-brand",
                      )}
                    >
                      {img ? (
                        <ImageIcon className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                      <span className="leading-none">
                        {img ? "IMG" : "PDF"}
                      </span>
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-bold">{file.name}</span>
                        <Badge variant={KIND_BADGE[file.kind]} size="sm">
                          {file.kind}
                        </Badge>
                      </div>
                      <div className="text-text-3 mt-0.5 text-xs">
                        {formatDate(file.createdAt)} · {formatSize(file.size)}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(file)}
                      >
                        View
                      </Button>
                      {canDelete && (
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => onDelete(file)}
                          disabled={isPending}
                          aria-label={`Delete ${file.name}`}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        {preview && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate pr-8">
                {preview.name}
              </DialogTitle>
            </DialogHeader>
            {isImage(preview.contentType) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/files/${preview.id}`}
                alt={preview.name}
                className="rounded-reno border-line max-h-[70vh] w-full border object-contain"
              />
            ) : (
              <iframe
                src={`/api/files/${preview.id}`}
                className="rounded-reno border-line h-[70vh] w-full border"
                title={preview.name}
              />
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
