"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

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
} from "@/lib/domain/tickets";
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function SubmitPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  // Honeypot: a hidden field only bots fill in. Read on submit, never validated.
  const honeypotRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
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

  async function onSubmit(values: CreateTicketInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypotRef.current?.value ?? "",
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setServerError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

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
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => {
              reset();
              setSubmitted(false);
            }}
          >
            Submit another
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to home
          </Link>
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
