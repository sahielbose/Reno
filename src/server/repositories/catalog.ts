import { db } from "@/lib/db";
import type { CostCatalogItemInput } from "@/server/schemas/catalog";

export function listCatalog(orgId: string) {
  return db.costCatalogItem.findMany({
    where: { orgId },
    orderBy: { code: "asc" },
  });
}

export function getCatalogItem(orgId: string, id: string) {
  return db.costCatalogItem.findFirst({ where: { id, orgId } });
}

export function createCatalogItem(orgId: string, input: CostCatalogItemInput) {
  return db.costCatalogItem.create({
    data: {
      orgId,
      code: input.code,
      name: input.name,
      unit: input.unit,
      defaultUnitCost: input.defaultUnitCost,
    },
  });
}

export async function updateCatalogItem(
  orgId: string,
  id: string,
  input: CostCatalogItemInput,
) {
  await db.costCatalogItem.findFirstOrThrow({ where: { id, orgId } });
  return db.costCatalogItem.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      unit: input.unit,
      defaultUnitCost: input.defaultUnitCost,
    },
  });
}

export async function deleteCatalogItem(orgId: string, id: string) {
  await db.costCatalogItem.findFirstOrThrow({ where: { id, orgId } });
  return db.costCatalogItem.delete({ where: { id } });
}
