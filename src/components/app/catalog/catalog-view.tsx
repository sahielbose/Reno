"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import { Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  costCatalogItemInputSchema,
  type CostCatalogItemInput,
} from "@/server/schemas/catalog";
import {
  createCatalogItemAction,
  updateCatalogItemAction,
  deleteCatalogItemAction,
} from "@/server/actions/catalog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";

/**
 * A single row in the cost catalog - the org-scoped library of reusable cost
 * codes that feed budgets, POs, and vendor bills (the "numbers carry forward"
 * spine). Kept intentionally lean for the table/form UI.
 */
export type CatalogItem = {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultUnitCost: number;
};

function toDefaults(item: CatalogItem | null): CostCatalogItemInput {
  return {
    code: item?.code ?? "",
    name: item?.name ?? "",
    unit: item?.unit ?? "EA",
    defaultUnitCost: item?.defaultUnitCost ?? 0,
  };
}

/**
 * CatalogView - the Cost Catalog module: a searchable table of cost codes plus
 * a create/edit form dialog. Rows are clickable to edit; the toolbar action
 * opens a blank form. Self-contained client component.
 */
export function CatalogView({
  items,
  canDelete,
}: {
  items: CatalogItem[];
  canDelete: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.code.toLowerCase().includes(q) || it.name.toLowerCase().includes(q),
    );
  }, [items, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CostCatalogItemInput>({
    // zod v4 schema vs @hookform/resolvers bundled types - runtime is fine.
    resolver: zodResolver(
      costCatalogItemInputSchema as never,
    ) as unknown as import("react-hook-form").Resolver<CostCatalogItemInput>,
    defaultValues: toDefaults(null),
  });

  React.useEffect(() => {
    if (open) {
      reset(toDefaults(editing));
    }
  }, [open, editing, reset]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditing(item);
    setOpen(true);
  }

  const submit = (values: CostCatalogItemInput) => {
    startTransition(async () => {
      const result = editing
        ? await updateCatalogItemAction(editing.id, values)
        : await createCatalogItemAction(values);

      if (result.ok) {
        toast.success("Saved");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  function handleDelete() {
    if (!editing) return;
    if (!window.confirm("Delete this cost code? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCatalogItemAction(editing.id);
      if (result.ok) {
        toast.success("Saved");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cost codes…"
          aria-label="Search cost codes"
          className="w-full sm:w-64"
        />

        <Button variant="primary" onClick={openCreate} className="ml-auto">
          + Add code
        </Button>
      </div>

      <Card>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <Layers className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              No cost codes match.
            </p>
            <p className="text-text-3 text-xs">
              Add a code to start building your catalog.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Default cost</TableHead>
                <TableHead className="text-right">Mapped to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((it) => (
                <TableRow
                  key={it.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => openEdit(it)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEdit(it);
                    }
                  }}
                  className="hover:bg-paper focus-visible:bg-paper cursor-pointer outline-none"
                >
                  <TableCell className="mono">{it.code}</TableCell>
                  <TableCell>
                    <span className="font-bold">{it.name}</span>
                  </TableCell>
                  <TableCell className="text-text-2">{it.unit}</TableCell>
                  <TableCell className="mono text-right">
                    {formatCurrency(it.defaultUnitCost)}
                  </TableCell>
                  <TableCell className="text-text-3 text-right text-xs">
                    ⟳ Accounting item
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit cost code" : "New cost code"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this reusable cost code."
                : "Add a reusable cost code to your catalog."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Code"
                htmlFor="catalog-code"
                required
                error={errors.code?.message}
              >
                <Input
                  id="catalog-code"
                  placeholder="01-100"
                  autoFocus
                  aria-invalid={errors.code ? true : undefined}
                  {...register("code")}
                />
              </Field>

              <Field
                label="Unit"
                htmlFor="catalog-unit"
                error={errors.unit?.message}
              >
                <Input
                  id="catalog-unit"
                  placeholder="EA"
                  aria-invalid={errors.unit ? true : undefined}
                  {...register("unit")}
                />
              </Field>
            </div>

            <Field
              label="Name"
              htmlFor="catalog-name"
              required
              error={errors.name?.message}
            >
              <Input
                id="catalog-name"
                placeholder="Framing labor"
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </Field>

            <Field
              label="Default cost"
              htmlFor="catalog-cost"
              error={errors.defaultUnitCost?.message}
            >
              <Input
                id="catalog-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                className="mono"
                aria-invalid={errors.defaultUnitCost ? true : undefined}
                {...register("defaultUnitCost", { valueAsNumber: true })}
              />
            </Field>

            <DialogFooter>
              {editing && canDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="mr-auto"
                >
                  Delete
                </Button>
              )}
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
    </div>
  );
}
