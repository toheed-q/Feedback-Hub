/**
 * Home page placeholder.
 *
 * The full landing page (intro + "Submit Feedback" call to action) is built in the
 * next increment. For now this keeps the app clean and on-brand instead of showing
 * framework boilerplate.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-primary">Feedback Hub</p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Coming together, one increment at a time.
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        The landing page and submission form are on their way.
      </p>
    </main>
  );
}
