import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { CATEGORY_LABELS, STATUSES, type Status } from "@/lib/domain/tickets";
import { StatusBadge } from "@/components/ticket-badges";
import { BoardSearch } from "@/components/board-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feedback board",
  description: "Track the status of submitted feedback.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function pickStatus(value: string | string[] | undefined): Status | undefined {
  return typeof value === "string" &&
    (STATUSES as readonly string[]).includes(value)
    ? (value as Status)
    : undefined;
}

export default async function FeedbackBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = pickStatus(sp.status);

  const where: Prisma.TicketWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { reference: { contains: q, mode: "insensitive" } },
    ];
  }

  // Public projection only — no submitter name, email, or description.
  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      reference: true,
      title: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Feedback board</h1>
        <p className="mt-2 text-muted-foreground">
          Track the status of submitted feedback. Search by your reference code
          (e.g. <span className="font-mono">FH-7K3M9Q</span>) to find yours.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <BoardSearch />
        </div>

        {tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No feedback found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search, or be the first to submit.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{t.reference}</span>
                    <span>·</span>
                    <span>{CATEGORY_LABELS[t.category]}</span>
                  </div>
                  <div className="mt-0.5 truncate font-medium text-foreground">
                    {t.title}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-muted-foreground">
                    {dateFmt.format(t.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
