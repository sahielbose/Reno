import { z } from "zod";
import { nonEmpty, optionalEmail } from "@/server/schemas/common";

export const contactTypeEnum = z.enum(["CLIENT", "SUB", "VENDOR", "CREW"]);
export type ContactTypeValue = z.infer<typeof contactTypeEnum>;

export const contactInputSchema = z.object({
  name: nonEmpty("Name"),
  type: contactTypeEnum.default("CLIENT"),
  company: z.string().trim().optional(),
  email: optionalEmail,
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  tags: z.array(z.string().trim()).default([]),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

/** Form-shaped schema: tags are edited as one comma-separated string in the UI
 *  and split into a string[] on submit. Used by the client form resolver. */
export const contactFormSchema = contactInputSchema
  .omit({ tags: true })
  .extend({ tags: z.string().optional() });

export type ContactFormValues = z.infer<typeof contactFormSchema>;
