"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUSES,
  STATUS_LABELS,
  type Status,
} from "@/lib/domain/tickets";
import { updateTicketStatus } from "@/lib/actions/tickets";

export function StatusSelect({
  ticketId,
  current,
}: {
  ticketId: string;
  current: Status;
}) {
  const [value, setValue] = React.useState<Status>(current);
  const [isPending, startTransition] = React.useTransition();

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (!v) return;
        setValue(v as Status);
        startTransition(() => updateTicketStatus(ticketId, v));
      }}
    >
      <SelectTrigger className="h-9 w-full" disabled={isPending}>
        <SelectValue>
          {(v: string) => STATUS_LABELS[(v || current) as Status]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
