"use client";

import { Fragment, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { lineTotal, sectionTotal, budgetTotal } from "@/lib/money";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addLineItemAction,
  addSectionAction,
  deleteLineItemAction,
  deleteSectionAction,
  updateLineItemAction,
} from "@/server/actions/budget";
import { insertCatalogItemAction } from "@/server/actions/catalog";

export type GridItem = {
  id: string;
  code: string | null;
  name: string;
  qty: number;
  unit: string;
  unitCost: number;
  markupPct: number;
};
export type GridSection = { id: string; name: string; items: GridItem[] };
export type CatalogPick = {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultUnitCost: number;
};

type NumericField = "qty" | "unitCost" | "markupPct";

export function BudgetGrid({
  projectId,
  budgetId,
  sections: initial,
  catalog = [],
  onGenerate,
}: {
  projectId: string;
  budgetId: string;
  sections: GridSection[];
  catalog?: CatalogPick[];
  onGenerate?: () => void;
}) {
  const router = useRouter();
  const [sections, setSections] = useState<GridSection[]>(initial);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const grand = budgetTotal(sections);

  function saveLine(itemId: string, patch: Partial<GridItem>) {
    clearTimeout(timers.current[itemId]);
    timers.current[itemId] = setTimeout(async () => {
      const result = await updateLineItemAction(projectId, itemId, patch);
      if (!result.ok) toast.error(result.error);
    }, 500);
  }

  function editText(
    sectionId: string,
    itemId: string,
    field: "name" | "unit",
    value: string,
  ) {
    setSections((secs) =>
      secs.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, [field]: value } : it,
              ),
            },
      ),
    );
    saveLine(itemId, { [field]: value });
  }

  function editNumber(
    sectionId: string,
    itemId: string,
    field: NumericField,
    raw: string,
  ) {
    const value = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(value)) return;
    setSections((secs) =>
      secs.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, [field]: value } : it,
              ),
            },
      ),
    );
    saveLine(itemId, { [field]: value });
  }

  async function addItem(sectionId: string) {
    const result = await addLineItemAction(projectId, sectionId);
    if (!result.ok) return toast.error(result.error);
    const id = result.data!.id;
    setSections((secs) =>
      secs.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: [
                ...s.items,
                {
                  id,
                  code: null,
                  name: "New item",
                  qty: 1,
                  unit: "EA",
                  unitCost: 0,
                  markupPct: 0,
                },
              ],
            },
      ),
    );
  }

  async function insertFromCatalog(sectionId: string, pick: CatalogPick) {
    const result = await insertCatalogItemAction(projectId, sectionId, pick.id);
    if (!result.ok) return toast.error(result.error);
    setSections((secs) =>
      secs.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: [
                ...s.items,
                {
                  id: result.data!.id,
                  code: pick.code,
                  name: pick.name,
                  qty: 1,
                  unit: pick.unit,
                  unitCost: pick.defaultUnitCost,
                  markupPct: 0,
                },
              ],
            },
      ),
    );
  }

  async function removeItem(sectionId: string, itemId: string) {
    setSections((secs) =>
      secs.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, items: s.items.filter((it) => it.id !== itemId) },
      ),
    );
    const result = await deleteLineItemAction(projectId, itemId);
    if (!result.ok) toast.error(result.error);
  }

  async function addSection() {
    const result = await addSectionAction(projectId, budgetId, "New section");
    if (!result.ok) return toast.error(result.error);
    setSections((secs) => [
      ...secs,
      { id: result.data!.id, name: "New section", items: [] },
    ]);
  }

  async function removeSection(sectionId: string) {
    setSections((secs) => secs.filter((s) => s.id !== sectionId));
    const result = await deleteSectionAction(projectId, sectionId);
    if (!result.ok) toast.error(result.error);
  }

  const inputCls =
    "w-full rounded-[7px] border border-transparent bg-transparent px-2 py-1 font-mono text-[0.85rem] outline-none hover:border-line focus:border-brand focus:bg-white";

  return (
    <div className="space-y-3">
      <div className="rounded-reno border-line shadow-card-sm overflow-hidden border bg-white">
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-display text-[1.05rem] font-semibold">Budget</h3>
          <Button
            variant="dark"
            size="sm"
            onClick={
              onGenerate ??
              (() => router.push(`/app/projects/${projectId}/proposal`))
            }
          >
            <Sparkles className="size-4" />
            Generate proposal
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-text-3 text-[0.62rem] tracking-wide uppercase">
                <th className="px-3 py-2 text-left font-bold">#</th>
                <th className="px-3 py-2 text-left font-bold">Item</th>
                <th className="px-3 py-2 text-right font-bold">Qty</th>
                <th className="px-3 py-2 text-center font-bold">Unit</th>
                <th className="px-3 py-2 text-right font-bold">Unit cost</th>
                <th className="px-3 py-2 text-right font-bold">Markup %</th>
                <th className="px-3 py-2 text-right font-bold">Line total</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <Fragment key={section.id}>
                  <tr className="group border-line bg-paper border-t font-semibold">
                    <td colSpan={2} className="px-3 py-2">
                      {section.name}
                    </td>
                    <td colSpan={4} />
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(sectionTotal(section.items))}
                    </td>
                    <td className="px-1 text-center">
                      <button
                        type="button"
                        aria-label="Delete section"
                        onClick={() => removeSection(section.id)}
                        className="text-text-3 hover:text-danger opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>

                  {section.items.map((item) => (
                    <tr
                      key={item.id}
                      className="group border-b border-[#f1f3f8]"
                    >
                      <td className="text-text-3 px-3 py-1 font-mono text-[0.72rem]">
                        {item.code ?? "-"}
                      </td>
                      <td className="px-1 py-1">
                        <input
                          aria-label="Item name"
                          value={item.name}
                          onChange={(e) =>
                            editText(
                              section.id,
                              item.id,
                              "name",
                              e.target.value,
                            )
                          }
                          className={cn(inputCls, "text-left font-sans")}
                        />
                      </td>
                      <td className="w-20 px-1 py-1">
                        <input
                          aria-label="Quantity"
                          value={item.qty}
                          onChange={(e) =>
                            editNumber(
                              section.id,
                              item.id,
                              "qty",
                              e.target.value,
                            )
                          }
                          className={cn(inputCls, "text-right")}
                        />
                      </td>
                      <td className="w-16 px-1 py-1">
                        <input
                          aria-label="Unit"
                          value={item.unit}
                          onChange={(e) =>
                            editText(
                              section.id,
                              item.id,
                              "unit",
                              e.target.value,
                            )
                          }
                          className={cn(inputCls, "text-center")}
                        />
                      </td>
                      <td className="w-28 px-1 py-1">
                        <input
                          aria-label="Unit cost"
                          value={item.unitCost}
                          onChange={(e) =>
                            editNumber(
                              section.id,
                              item.id,
                              "unitCost",
                              e.target.value,
                            )
                          }
                          className={cn(inputCls, "text-right")}
                        />
                      </td>
                      <td className="w-20 px-1 py-1">
                        <input
                          aria-label="Markup percent"
                          value={item.markupPct}
                          onChange={(e) =>
                            editNumber(
                              section.id,
                              item.id,
                              "markupPct",
                              e.target.value,
                            )
                          }
                          className={cn(inputCls, "text-right")}
                        />
                      </td>
                      <td className="w-28 px-3 py-1 text-right font-mono font-semibold">
                        {formatCurrency(
                          lineTotal(item.qty, item.unitCost, item.markupPct),
                        )}
                      </td>
                      <td className="px-1 text-center">
                        <button
                          type="button"
                          aria-label="Delete item"
                          onClick={() => removeItem(section.id, item.id)}
                          className="text-text-3 hover:text-danger opacity-0 transition group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan={8} className="px-3 py-1.5">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => addItem(section.id)}
                          className="text-text-3 hover:text-brand inline-flex items-center gap-1 text-[0.8rem] font-medium"
                        >
                          <Plus className="size-3.5" /> Add item
                        </button>
                        {catalog.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button
                                  type="button"
                                  className="text-text-3 hover:text-brand inline-flex items-center gap-1 text-[0.8rem] font-medium"
                                />
                              }
                            >
                              <BookOpen className="size-3.5" /> From catalog
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-72">
                              <DropdownMenuLabel>
                                Insert a cost code
                              </DropdownMenuLabel>
                              {catalog.map((pick) => (
                                <DropdownMenuItem
                                  key={pick.id}
                                  onClick={() =>
                                    insertFromCatalog(section.id, pick)
                                  }
                                  className="justify-between gap-3"
                                >
                                  <span className="truncate">
                                    <span className="mono text-text-3 mr-1.5">
                                      {pick.code}
                                    </span>
                                    {pick.name}
                                  </span>
                                  <span className="mono text-text-3">
                                    {formatCurrency(pick.defaultUnitCost)}
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-b-reno bg-ink flex items-center justify-between px-5 py-4 text-white">
          <span className="text-sm">Total contract value</span>
          <span className="font-mono text-[1.5rem] font-bold">
            {formatCurrency(grand)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={addSection}>
          <Plus className="size-4" /> Add section
        </Button>
        <p className="text-text-3 text-[0.82rem]">
          Edit any quantity or cost - totals recalculate live and save
          automatically.
        </p>
      </div>
    </div>
  );
}
