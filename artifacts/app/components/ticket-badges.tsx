import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Priority,
  type Status,
} from "@/lib/domain/tickets";

/**
 * The one place ticket status/priority colours are defined. Every table, filter,
 * and detail view reads from here so the colour language stays consistent.
 */
const STATUS_CLASS: Record<Status, string> = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  REVIEWING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  IN_PROGRESS: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CLOSED: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

const PRIORITY_CLASS: Record<Priority, string> = {
  LOW: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  HIGH: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("border-transparent", STATUS_CLASS[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={cn("border-transparent", PRIORITY_CLASS[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
