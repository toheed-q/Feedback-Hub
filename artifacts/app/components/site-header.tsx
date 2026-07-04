import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

/** Shared top bar for the public pages: brand, submit action, theme toggle. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessagesSquare className="size-5" />
          </span>
          <span>Feedback Hub</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <Link
            href="/submit"
            className={buttonVariants({ className: "h-9 px-4" })}
          >
            Submit Feedback
          </Link>
        </div>
      </div>
    </header>
  );
}
