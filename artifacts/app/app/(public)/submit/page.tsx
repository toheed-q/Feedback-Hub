"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import {
  createTicketSchema,
  type CreateTicketInput,
} from "@/lib/validation/ticket";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  type Category,
  type Priority,
  type Status,
} from "@/lib/domain/tickets";
import { StatusBadge } from "@/components/ticket-badges";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScreenshotUploader } from "@/components/screenshot-uploader";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Submit Feedback</h1>
        <p className="mt-2 text-muted-foreground">
          Report a bug, request a feature, or share an idea. Fields marked with{" "}
          <span className="text-destructive">*</span> are required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tell us what&apos;s on your mind</CardTitle>
          <CardDescription>
            The more detail you give, the faster we can act on it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
            {/* Honeypot — hidden from real users; bots that auto-fill it are rejected. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
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
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="submitterName">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submitterName"
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.submitterName}
                  {...register("submitterName")}
                />
                <FieldError message={errors.submitterName?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="submitterEmail">Email (optional)</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  placeholder="jane@company.com"
                  aria-invalid={!!errors.submitterEmail}
                  {...register("submitterEmail")}
                />
                <FieldError message={errors.submitterEmail?.message} />
              </div>
            </div>

            {/* Category + Priority */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={!!errors.category}
                      >
                        <SelectValue placeholder="Select a category">
                          {(value: Category | null) =>
                            value ? CATEGORY_LABELS[value] : "Select a category"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.category?.message} />
              </div>

              <div className="grid gap-2">
                <Label>
                  Priority <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={!!errors.priority}
                      >
                        <SelectValue placeholder="Select a priority">
                          {(value: Priority | null) =>
                            value ? PRIORITY_LABELS[value] : "Select a priority"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.priority?.message} />
              </div>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Short summary of your feedback"
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
                        This may already have been reported
                      </p>
                      <p className="text-xs text-muted-foreground">
                        If your issue is one of these, it&apos;s already being
                        tracked. You can still submit if yours is different.
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
                rows={6}
                placeholder="Describe what happened, what you expected, and any steps to reproduce."
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            {/* Screenshots */}
            <div className="grid gap-2">
              <Label>Screenshots (optional)</Label>
              <ScreenshotUploader key={attemptKey} onChange={setScreenshotUrls} />
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} className="h-9 px-5">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Submitting…" : "Submit Feedback"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
