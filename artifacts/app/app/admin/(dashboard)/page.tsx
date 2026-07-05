import {
  CircleDot,
  CheckCircle2,
  Flame,
  CalendarPlus,
  Inbox,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  OPEN_STATUSES,
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  STATUSES,
  type Category,
  type Priority,
  type Status,
} from "@/lib/domain/tickets";
import { TicketFilters } from "@/components/admin/ticket-filters";
import { TicketRow } from "@/components/admin/ticket-row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const SUMMARY_ICONS = {
  open: CircleDot,
  completed: CheckCircle2,
  high: Flame,
  week: CalendarPlus,
} as const;

/** Returns the value only if it's a member of the allowed list — guards URL params. */
function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof SUMMARY_ICONS;
}) {
  const Icon = SUMMARY_ICONS[icon];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = pick<Status>(sp.status, STATUSES);
  const category = pick<Category>(sp.category, CATEGORIES);
  const priority = pick<Priority>(sp.priority, PRIORITIES);

  const where: Prisma.TicketWhereInput = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { submitterName: { contains: q, mode: "insensitive" } },
    ];
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const hasFilters = Boolean(q || status || category || priority);

  // Summary cards reflect the whole workspace; only the table honours the filters.
  const [openCount, completedCount, highCount, newThisWeek, tickets] =
    await Promise.all([
      prisma.ticket.count({ where: { status: { in: [...OPEN_STATUSES] } } }),
      prisma.ticket.count({ where: { status: "COMPLETED" } }),
      prisma.ticket.count({
        where: { priority: "HIGH", status: { in: [...OPEN_STATUSES] } },
      }),
      prisma.ticket.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage incoming feedback.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Open tickets" value={openCount} icon="open" />
        <SummaryCard label="Completed" value={completedCount} icon="completed" />
        <SummaryCard label="High priority" value={highCount} icon="high" />
        <SummaryCard label="New this week" value={newThisWeek} icon="week" />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <TicketFilters />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <Inbox className="mx-auto size-8 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No tickets found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hasFilters
                      ? "Try adjusting your search or filters."
                      : "New submissions will appear here."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  categoryLabel={CATEGORY_LABELS[t.category]}
                  submitterName={t.submitterName}
                  priority={t.priority}
                  status={t.status}
                  dateLabel={dateFmt.format(t.createdAt)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
