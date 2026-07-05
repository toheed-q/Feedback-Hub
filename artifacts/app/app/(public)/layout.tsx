import { SiteHeader } from "@/components/site-header";

/** Layout for the public-facing pages (landing + submission form). */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Feedback Hub</span>
          <span>Bugs · Feature requests · Ideas · Feedback</span>
        </div>
      </footer>
    </div>
  );
}
