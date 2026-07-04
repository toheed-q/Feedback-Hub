import { z } from "zod";
import { CATEGORIES, PRIORITIES } from "@/lib/domain/tickets";

/**
 * Validation for a new public feedback submission.
 *
 * Shared by the submission form (client-side) and the create API (server-side)
 * so both enforce exactly the same rules.
 */
export const createTicketSchema = z.object({
  submitterName: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(120, "Name is too long"),

  // Email is optional. We accept an empty string (the field left blank) or a
  // valid email; anything else is rejected.
  submitterEmail: z
    .union([z.literal(""), z.email("Please enter a valid email").max(200)])
    .optional(),

  category: z.enum(CATEGORIES, { message: "Please choose a category" }),

  priority: z.enum(PRIORITIES, { message: "Please choose a priority" }),

  title: z
    .string()
    .trim()
    .min(3, "Title is too short")
    .max(160, "Title is too long"),

  description: z
    .string()
    .trim()
    .min(10, "Please add a little more detail")
    .max(5000, "Description is too long"),

  // Screenshots are uploaded to storage first; here we only carry the resulting
  // URLs. Optional, and capped so a single submission can't attach an unlimited
  // number of files.
  screenshotUrls: z.array(z.url()).max(10, "Too many screenshots").optional().default([]),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
