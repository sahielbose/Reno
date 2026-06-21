"use client";

import * as React from "react";
import { useTransition } from "react";
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
  CONTACT_TYPES,
  CONTACT_TYPE_LABEL,
} from "@/components/app/contacts/contact-badge";
import { contactFormSchema, type ContactInput } from "@/server/schemas/contact";
import {
  createContactAction,
  updateContactAction,
} from "@/server/actions/contact";
import { type ContactWithProjects } from "@/server/repositories/contact";

/**
 * The form values used in the UI. We treat tags as a single comma-separated
 * string while editing and split it back into a string[] on submit.
 */
type FormValues = Omit<ContactInput, "tags"> & { tags: string };

/** Singular-ish labels for the type select (CONTACT_TYPE_LABEL is plural). */
const TYPE_OPTION_LABEL: Record<(typeof CONTACT_TYPES)[number], string> = {
  CLIENT: "Client",
  SUB: "Sub",
  VENDOR: "Vendor",
  CREW: "Crew",
};

/** Shared control classes — matches the Input look for the select & textarea. */
const controlClass = cn(
  "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
  "placeholder:text-text-3",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-danger aria-invalid:ring-danger/20",
);

function toDefaults(contact: ContactWithProjects | null): FormValues {
  return {
    name: contact?.name ?? "",
    type: contact?.type ?? "CLIENT",
    company: contact?.company ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    address: contact?.address ?? "",
    notes: contact?.notes ?? "",
    tags: contact?.tags?.join(", ") ?? "",
  };
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact: ContactWithProjects | null;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    // zod v4 schema vs @hookform/resolvers bundled v4.0 types — runtime is fine.
    resolver: zodResolver(
      contactFormSchema as never,
    ) as unknown as import("react-hook-form").Resolver<FormValues>,
    defaultValues: toDefaults(contact),
  });

  React.useEffect(() => {
    if (open) {
      reset(toDefaults(contact));
    }
  }, [open, contact, reset]);

  const submit = (values: FormValues) => {
    const data: ContactInput = {
      name: values.name.trim(),
      type: values.type,
      company: values.company?.trim() || undefined,
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      address: values.address?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      const result = contact
        ? await updateContactAction(contact.id, data)
        : await createContactAction(data);

      if (result.ok) {
        toast.success(contact ? "Contact updated" : "Contact added");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "New contact"}</DialogTitle>
          <DialogDescription>
            {contact
              ? "Update the details for this contact."
              : "Add a client, sub, vendor, or crew member to your directory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              htmlFor="contact-name"
              required
              error={errors.name?.message}
            >
              <Input
                id="contact-name"
                placeholder="Jane Contractor"
                autoFocus
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </Field>

            <Field
              label="Type"
              htmlFor="contact-type"
              error={errors.type?.message}
            >
              <select
                id="contact-type"
                className={controlClass}
                aria-invalid={errors.type ? true : undefined}
                {...register("type")}
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_OPTION_LABEL[t] ?? CONTACT_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Company"
            htmlFor="contact-company"
            error={errors.company?.message}
          >
            <Input
              id="contact-company"
              placeholder="Acme Builders"
              aria-invalid={errors.company ? true : undefined}
              {...register("company")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Email"
              htmlFor="contact-email"
              error={errors.email?.message}
            >
              <Input
                id="contact-email"
                type="email"
                placeholder="jane@example.com"
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
              />
            </Field>

            <Field
              label="Phone"
              htmlFor="contact-phone"
              error={errors.phone?.message}
            >
              <Input
                id="contact-phone"
                type="tel"
                placeholder="(555) 010-0142"
                aria-invalid={errors.phone ? true : undefined}
                {...register("phone")}
              />
            </Field>
          </div>

          <Field
            label="Address"
            htmlFor="contact-address"
            error={errors.address?.message}
          >
            <Input
              id="contact-address"
              placeholder="123 Main St, Springfield"
              aria-invalid={errors.address ? true : undefined}
              {...register("address")}
            />
          </Field>

          <Field
            label="Notes"
            htmlFor="contact-notes"
            error={errors.notes?.message}
          >
            <textarea
              id="contact-notes"
              rows={3}
              className={cn(controlClass, "resize-y")}
              placeholder="Anything worth remembering…"
              aria-invalid={errors.notes ? true : undefined}
              {...register("notes")}
            />
          </Field>

          <Field
            label="Tags"
            htmlFor="contact-tags"
            description="Separate tags with commas."
            error={errors.tags?.message}
          >
            <Input
              id="contact-tags"
              placeholder="preferred, plumbing, local"
              aria-invalid={errors.tags ? true : undefined}
              {...register("tags")}
            />
          </Field>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
