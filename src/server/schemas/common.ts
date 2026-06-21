import { z } from "zod";

/** A trimmed, non-empty string. */
export const nonEmpty = (label = "This field") =>
  z.string().trim().min(1, `${label} is required`);

/** Optional email that also accepts an empty string (from form inputs). */
export const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .optional()
  .or(z.literal(""));

/** Coerce a form value to a finite number >= 0. */
export const nonNegativeNumber = z.coerce
  .number()
  .finite()
  .min(0, "Must be 0 or more");

export const cuid = z.string().min(1);
