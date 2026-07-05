import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Mail, User } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/lib/domain/tickets";
import { StatusBadge, PriorityBadge } from "@/components/ticket-badges";
import { StatusSelect } from "@/components/admin/status-select";
import { AddNoteForm } from "@/components/admin/add-note-form";
import { DeleteTicketButton } from "@/components/admin/delete-ticket-button";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      attachments: true,
    },
  });

  if (!ticket) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {CATEGORY_LABELS[ticket.category]}
          </span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
              {ticket.description}
            </p>
          </section>

          {ticket.attachments.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground">
                Screenshots
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {ticket.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {a.fileName ?? "Attachment"}
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Internal notes</h2>
            <p className="text-xs text-muted-foreground">
              Only visible to admins — never shown to the submitter.
            </p>

            <div className="mt-4">
              <AddNoteForm ticketId={ticket.id} />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {ticket.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                ticket.notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {n.body}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {dateFmt.format(n.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
            <div className="mt-2">
              <StatusSelect ticketId={ticket.id} current={ticket.status} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground">Details</h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-4 shrink-0 text-muted-foreground" />
                <span>{ticket.submitterName}</span>
              </div>
              {ticket.submitterEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`mailto:${ticket.submitterEmail}`}
                    className="text-primary hover:underline"
                  >
                    {ticket.submitterEmail}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Submitted {dateFmt.format(ticket.createdAt)}
                </span>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-destructive/20 bg-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground">
              Danger zone
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Deleting a ticket is permanent.
            </p>
            <div className="mt-3">
              <DeleteTicketButton ticketId={ticket.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
