"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  HelpCircle,
  Loader2,
  MessageSquare,
  PenLine,
  Search,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import {
  createTicketSchema,
  type CreateTicketInput,
} from "@/lib/validation/ticket";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  type Status,
} from "@/lib/domain/tickets";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ticket-badges";
import { ScreenshotUploader } from "@/components/screenshot-uploader";

const CATEGORY_ICONS = {
  BUG: Bug,
  FEATURE_REQUEST: Sparkles,
  IMPROVEMENT: TrendingUp,
  QUESTION: HelpCircle,
  GENERAL_FEEDBACK: MessageSquare,
} as const;

const PRIORITY_SELECTED: Record<string, string> = {
  LOW: "bg-zinc-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  HIGH: "bg-rose-500 text-white",
};

const STEPS = [
  {
    icon: PenLine,
    title: "You file a ticket",
    body: "Pick a category, set the priority honestly, describe what you saw.",
  },
  {
    icon: Search,
    title: "We triage it",
    body: "Every ticket is reviewed and moved through New → Reviewing → In Progress.",
  },
  {
    icon: CheckCircle2,
    title: "It gets shipped",
    body: "Bugs get fixed, good ideas get built. Leave an email to hear back.",
  },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function SubmitPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [reference, setReference] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  // Honeypot: a hidden field only bots fill in. Read on submit, never validated.
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  const [screenshotUrls, setScreenshotUrls] = React.useState<string[]>([]);
  // Bumped on "Submit another" to remount the uploader with a clean slate.
  const [attemptKey, setAttemptKey] = React.useState(0);
  // Duplicate hint: similar open tickets found as the title is typed.
  const [similar, setSimilar] = React.useState<
    { title: string; status: Status }[]
  >([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      submitterName: "",
      submitterEmail: "",
      title: "",
      description: "",
      screenshotUrls: [],
    },
  });

  const titleValue = watch("title");
  React.useEffect(() => {
    const q = (titleValue ?? "").trim();
    if (q.length < 4) {
      setSimilar([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tickets/similar?q=${encodeURIComponent(q)}`,
        );
        setSimilar(res.ok ? await res.json() : []);
      } catch {
        setSimilar([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [titleValue]);

  async function onSubmit(values: CreateTicketInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          screenshotUrls,
          website: honeypotRef.current?.value ?? "",
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string; reference?: string }
        | null;

      if (!res.ok) {
        setServerError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setReference(data?.reference ?? null);
      setSubmitted(true);
    } catch {
      setServerError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Thank you — we&apos;ve got it
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your feedback has been received. Our team reviews every submission and
          will follow up if we need more detail.
        </p>

        {reference && (
          <div className="mt-6 w-full rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Your reference</p>
            <p className="mt-0.5 font-mono text-lg font-semibold tracking-wider text-foreground">
              {reference}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Save this — you can track your feedback&apos;s status on the board
              anytime.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/feedback" className={buttonVariants({})}>
            Track on the board
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setSubmitted(false);
              setReference(null);
              setScreenshotUrls([]);
              setAttemptKey((k) => k + 1);
            }}
          >
            Submit another
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
      {/* Hero */}
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Spotted a bug?
          <br />
          Got an <span className="text-primary">idea?</span> File a ticket.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every submission gets a ticket number and lands straight on our review
          board. Takes about a minute — no account needed.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Form slip */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              New submission
            </h2>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Slip
            </span>
          </div>
          <div className="my-5 border-t border-dashed border-border" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5"
            noValidate
          >
            {/* Honeypot — hidden from real users. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
            >
              <label htmlFor="website">Website</label>
              <input
                ref={honeypotRef}
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name + Email */}
            <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
              <div className="grid gap-2">
                <Label htmlFor="submitterName">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submitterName"
                  placeholder="Your name"
                  aria-invalid={!!errors.submitterName}
                  {...register("submitterName")}
                />
                <FieldError message={errors.submitterName?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="submitterEmail">
                  Email{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  placeholder="you@company.com"
                  aria-invalid={!!errors.submitterEmail}
                  {...register("submitterEmail")}
                />
                <p className="text-xs text-muted-foreground">
                  Only used if we need more details.
                </p>
                <FieldError message={errors.submitterEmail?.message} />
              </div>
            </div>

            {/* Category pills */}
            <div className="grid gap-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => {
                      const Icon = CATEGORY_ICONS[c];
                      const selected = field.value === c;
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => field.onChange(c)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:bg-muted",
                          )}
                        >
                          <Icon className="size-3.5" />
                          {CATEGORY_LABELS[c]}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError message={errors.category?.message} />
            </div>

            {/* Priority segmented control */}
            <div className="grid gap-2">
              <Label>
                Priority <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border">
                    {PRIORITIES.map((pr, i) => {
                      const selected = field.value === pr;
                      return (
                        <button
                          type="button"
                          key={pr}
                          onClick={() => field.onChange(pr)}
                          className={cn(
                            "py-2.5 text-sm font-medium transition-colors",
                            i > 0 && "border-l border-border",
                            selected
                              ? PRIORITY_SELECTED[pr]
                              : "bg-background text-foreground hover:bg-muted",
                          )}
                        >
                          {PRIORITY_LABELS[pr]}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              <p className="text-xs text-muted-foreground">
                High = something is blocked or broken for you right now.
              </p>
              <FieldError message={errors.priority?.message} />
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder={`One line summary, e.g. "Export button fails on Reports page"`}
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />

              {similar.length > 0 && (
                <div className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        We found similar tickets
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check the status below. You can still submit if yours is
                        different or you&apos;re seeing it again.
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {similar.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="truncate text-foreground">
                              {s.title}
                            </span>
                            <StatusBadge status={s.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="What happened? What did you expect? Steps to reproduce help a lot."
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            {/* Screenshots */}
            <div className="grid gap-2">
              <Label>
                Screenshot{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <ScreenshotUploader key={attemptKey} onChange={setScreenshotUrls} />
            </div>

            <div className="border-t border-dashed border-border pt-5">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-muted-foreground">
                Fields marked with{" "}
                <span className="text-destructive">*</span> are required. Your
                ticket is timestamped automatically.
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-10 gap-2 px-5 text-base"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Submitting…" : "Submit feedback"}
                {!isSubmitting && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </form>
        </div>

        {/* How it works */}
        <aside className="flex flex-col gap-6 lg:pt-2">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                <step.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {i + 1} · {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
