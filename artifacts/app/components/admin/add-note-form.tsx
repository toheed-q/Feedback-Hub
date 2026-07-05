"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addTicketNote } from "@/lib/actions/tickets";

export function AddNoteForm({ ticketId }: { ticketId: string }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = React.useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await addTicketNote(ticketId, formData);
          formRef.current?.reset();
        })
      }
      className="grid gap-2"
    >
      <Textarea
        name="body"
        rows={3}
        required
        maxLength={2000}
        placeholder="Add an internal note (only admins can see this)…"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" className="h-9 px-4" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Adding…" : "Add note"}
        </Button>
      </div>
    </form>
  );
}
