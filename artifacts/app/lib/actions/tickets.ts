"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STATUSES, type Status } from "@/lib/domain/tickets";

/** Every admin mutation is gated on a valid session (defence in depth alongside middleware). */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
}

export async function updateTicketStatus(id: string, status: string) {
  await requireAdmin();

  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status value.");
  }

  await prisma.ticket.update({
    where: { id },
    data: { status: status as Status },
  });

  revalidatePath(`/admin/tickets/${id}`);
  revalidatePath("/admin");
}

const noteSchema = z.string().trim().min(1).max(2000);

export async function addTicketNote(id: string, formData: FormData) {
  await requireAdmin();

  const parsed = noteSchema.safeParse(formData.get("body"));
  if (!parsed.success) return;

  await prisma.internalNote.create({
    data: { ticketId: id, body: parsed.data },
  });

  revalidatePath(`/admin/tickets/${id}`);
}

export async function deleteTicket(id: string) {
  await requireAdmin();

  await prisma.ticket.delete({ where: { id } });

  revalidatePath("/admin");
  redirect("/admin");
}
