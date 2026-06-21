import { z } from "zod";
import { nonEmpty, nonNegativeNumber } from "@/server/schemas/common";

export const costCatalogItemInputSchema = z.object({
  code: nonEmpty("Code"),
  name: nonEmpty("Name"),
  unit: z.string().trim().default("EA"),
  defaultUnitCost: nonNegativeNumber.default(0),
});

export type CostCatalogItemInput = z.infer<typeof costCatalogItemInputSchema>;
