"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ticket-badges";
import type { Priority, Status } from "@/lib/domain/tickets";

export function TicketRow({
  id,
  title,
  categoryLabel,
  submitterName,
  priority,
  status,
  dateLabel,
}: {
  id: string;
  title: string;
  categoryLabel: string;
  submitterName: string;
  priority: Priority;
  status: Status;
  dateLabel: string;
}) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/admin/tickets/${id}`)}
    >
      <TableCell>
        <Link
          href={`/admin/tickets/${id}`}
          className="font-medium text-foreground hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {title}
        </Link>
        <div className="text-xs text-muted-foreground">{categoryLabel}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">{submitterName}</TableCell>
      <TableCell>
        <PriorityBadge priority={priority} />
      </TableCell>
      <TableCell>
        <StatusBadge status={status} />
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        {dateLabel}
      </TableCell>
    </TableRow>
  );
}
