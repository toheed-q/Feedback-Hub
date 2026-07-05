import {
  ChevronDown,
  CircleDot,
  CheckCircle2,
  Flame,
  CalendarPlus,
  Search,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { OPEN_STATUSES, CATEGORY_LABELS } from "@/lib/domain/tickets";
import { StatusBadge, PriorityBadge } from "@/components/ticket-badges";
import { Input } from "@/components/ui/input";
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

/** A read-only preview of the filter controls; wired up in the next unit. */
function FakeSelect({ label }: { label: string }) {
  return (
    <div className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-sm text-muted-foreground sm:w-40 dark:bg-input/30">
      {label}
      <ChevronDown className="size-4" />
    </div>
  );
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

export default async function AdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [openCount, completedCount, highCount, newThisWeek, tickets] =
    await Promise.all([
      prisma.ticket.count({ where: { status: { in: [...OPEN_STATUSES] } } }),
      prisma.ticket.count({ where: { status: "COMPLETED" } }),
      prisma.ticket.count({
        where: { priority: "HIGH", status: { in: [...OPEN_STATUSES] } },
      }),
      prisma.ticket.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.ticket.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage incoming feedback.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Open tickets" value={openCount} icon="open" />
        <SummaryCard label="Completed" value={completedCount} icon="completed" />
        <SummaryCard label="High priority" value={highCount} icon="high" />
        <SummaryCard label="New this week" value={newThisWeek} icon="week" />
      </div>

      {/* Filters + table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets…"
              className="h-9 pl-9"
              disabled
            />
          </div>
          <FakeSelect label="All statuses" />
          <FakeSelect label="All categories" />
          <FakeSelect label="All priorities" />
        </div>

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
            {tickets.map((t) => (
              <TableRow key={t.id} className="cursor-pointer">
                <TableCell>
                  <div className="font-medium text-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[t.category]}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.submitterName}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={t.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {dateFmt.format(t.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
