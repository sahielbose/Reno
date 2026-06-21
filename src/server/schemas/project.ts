import { z } from "zod";
import { nonEmpty } from "@/server/schemas/common";

export const projectStatusEnum = z.enum([
  "LEAD",
  "BIDDING",
  "PLANNING",
  "ACTIVE",
  "CLOSED",
]);
export type ProjectStatusValue = z.infer<typeof projectStatusEnum>;

export const projectInputSchema = z.object({
  name: nonEmpty("Project name"),
  clientId: z.string().min(1).optional(),
  address: z.string().trim().optional(),
  trade: z.string().trim().optional(),
  status: projectStatusEnum.default("LEAD"),
  icon: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  targetEndDate: z.coerce.date().optional(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
