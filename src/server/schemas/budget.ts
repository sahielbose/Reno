import { z } from "zod";
import { nonEmpty, nonNegativeNumber } from "@/server/schemas/common";

export const budgetLineItemInputSchema = z.object({
  name: nonEmpty("Item name"),
  qty: nonNegativeNumber.default(1),
  unit: z.string().trim().default("EA"),
  unitCost: nonNegativeNumber.default(0),
  markupPct: z.coerce.number().min(0).max(1000).default(0),
  costCatalogItemId: z.string().min(1).optional(),
});
export type BudgetLineItemInput = z.infer<typeof budgetLineItemInputSchema>;

export const budgetSectionInputSchema = z.object({
  name: nonEmpty("Section name"),
});
export type BudgetSectionInput = z.infer<typeof budgetSectionInputSchema>;

/** Partial patch used by the inline budget grid (single field at a time). */
export const budgetLineItemPatchSchema = budgetLineItemInputSchema
  .partial()
  .extend({ name: z.string().trim().min(1).optional() });
export type BudgetLineItemPatch = z.infer<typeof budgetLineItemPatchSchema>;
