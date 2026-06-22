"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABEL,
} from "@/components/app/project/project-status-badge";
import {
  projectInputSchema,
  type ProjectInput,
} from "@/server/schemas/project";
import { createProjectAction } from "@/server/actions/project";

/** Shared control classes — matches the Input look for the selects. */
const controlClass = cn(
  "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
  "placeholder:text-text-3",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-danger aria-invalid:ring-danger/20",
);

function toDefaults(): ProjectInput {
  return {
    name: "",
    clientId: undefined,
    address: undefined,
    trade: undefined,
    status: "LEAD",
  };
}

export function NewProjectDialog({
  open,
  onOpenChange,
  clients,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectInput>({
    // zod v4 schema vs @hookform/resolvers bundled v4.0 types — runtime is fine.
    resolver: zodResolver(
      projectInputSchema as never,
    ) as unknown as import("react-hook-form").Resolver<ProjectInput>,
    defaultValues: toDefaults(),
  });

  React.useEffect(() => {
    if (open) {
      reset(toDefaults());
    }
  }, [open, reset]);

  const submit = (values: ProjectInput) => {
    const data: ProjectInput = {
      name: values.name.trim(),
      clientId: values.clientId?.trim() || undefined,
      trade: values.trade?.trim() || undefined,
      status: values.status,
      address: values.address?.trim() || undefined,
    };

    startTransition(async () => {
      const result = await createProjectAction(data);

      if (result.ok) {
        toast.success("Project created");
        onOpenChange(false);
        router.push(`/app/projects/${result.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Start a new project — you can fill in the rest of the details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Field
            label="Project name"
            htmlFor="project-name"
            required
            error={errors.name?.message}
          >
            <Input
              id="project-name"
              placeholder="Maple St. Kitchen Remodel"
              autoFocus
              aria-invalid={errors.name ? true : undefined}
              {...register("name")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Client"
              htmlFor="project-client"
              error={errors.clientId?.message}
            >
              <select
                id="project-client"
                className={controlClass}
                aria-invalid={errors.clientId ? true : undefined}
                defaultValue=""
                {...register("clientId")}
              >
                <option value="">— No client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Status"
              htmlFor="project-status"
              error={errors.status?.message}
            >
              <select
                id="project-status"
                className={controlClass}
                aria-invalid={errors.status ? true : undefined}
                {...register("status")}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Trade"
              htmlFor="project-trade"
              error={errors.trade?.message}
            >
              <Input
                id="project-trade"
                placeholder="Remodel"
                aria-invalid={errors.trade ? true : undefined}
                {...register("trade")}
              />
            </Field>

            <Field
              label="Address"
              htmlFor="project-address"
              error={errors.address?.message}
            >
              <Input
                id="project-address"
                placeholder="123 Main St, Springfield"
                aria-invalid={errors.address ? true : undefined}
                {...register("address")}
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
