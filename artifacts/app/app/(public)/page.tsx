import Link from "next/link";
import {
  ArrowRight,
  Bug,
  Lightbulb,
  MessageSquare,
  Sparkles,
  HelpCircle,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const CATEGORY_HIGHLIGHTS = [
  {
    icon: Bug,
    title: "Bugs",
    description: "Something broken or not working the way it should.",
  },
  {
    icon: Lightbulb,
    title: "Feature Requests",
    description: "A new capability you'd love to see added.",
  },
  {
    icon: Sparkles,
    title: "Improvements",
    description: "A way to make something existing work better.",
  },
  {
    icon: HelpCircle,
    title: "Questions",
    description: "Something you're unsure about or need help with.",
  },
  {
    icon: MessageSquare,
    title: "General Feedback",
    description: "Any other thoughts you'd like to share.",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3.5" />
            We read every submission
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Tell us what to fix, build, or improve
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Feedback Hub is where employees and customers report bugs, request features, and
            share ideas for our internal apps — all in one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/submit"
              className={buttonVariants({
                size: "lg",
                className: "h-11 gap-2 px-6 text-base",
              })}
            >
              Submit Feedback
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#categories"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 px-6 text-base",
              })}
            >
              What can I share?
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto w-full max-w-5xl px-6 pb-24"
      >
        <h2 className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Share anything
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-medium text-card-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}

          {/* CTA card to fill the 6th grid cell */}
          <div className="flex flex-col justify-between rounded-xl border border-primary/30 bg-primary/5 p-5">
            <div>
              <h3 className="font-medium text-foreground">Ready to share?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                It only takes a minute.
              </p>
            </div>
            <Link
              href="/submit"
              className={buttonVariants({
                size: "sm",
                className: "mt-4 h-9 w-fit gap-1.5 px-4",
              })}
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
