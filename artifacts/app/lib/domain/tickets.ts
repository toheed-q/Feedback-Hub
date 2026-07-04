/**
 * Single source of truth for the ticket value lists.
 *
 * The database enforces these same values as Prisma enums (see prisma/schema.prisma).
 * Here we keep the human-readable labels and the display order, so the form, the
 * filters, and the status badges all read from one place and can never drift apart.
 *
 * The string values below MUST match the Prisma enum member names exactly.
 */

export const CATEGORIES = [
  "BUG",
  "FEATURE_REQUEST",
  "IMPROVEMENT",
  "QUESTION",
  "GENERAL_FEEDBACK",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  BUG: "Bug",
  FEATURE_REQUEST: "Feature Request",
  IMPROVEMENT: "Improvement",
  QUESTION: "Question",
  GENERAL_FEEDBACK: "General Feedback",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

/** Ordered by the natural lifecycle of a ticket. */
export const STATUSES = [
  "NEW",
  "REVIEWING",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

/** Statuses that count as "open" (not yet resolved) — used by the dashboard cards. */
export const OPEN_STATUSES = ["NEW", "REVIEWING", "IN_PROGRESS"] as const satisfies readonly Status[];

/** Small helpers so callers can label a raw enum value without importing the maps directly. */
export const categoryLabel = (value: Category): string => CATEGORY_LABELS[value];
export const priorityLabel = (value: Priority): string => PRIORITY_LABELS[value];
export const statusLabel = (value: Status): string => STATUS_LABELS[value];
