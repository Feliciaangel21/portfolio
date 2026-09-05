import { ArrowLeft } from "lucide-react";

// Was in Indonesian with a magnifying-glass emoji on a blue gradient, while
// every other page is in English. Now it matches the rest of the site.
export default function NotFoundPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-paper">
      <div className="shell max-w-prose">
        <p className="nums text-meta uppercase text-ink-muted">Error 404</p>

        <h1 className="mt-6 text-4xl">This page does not exist.</h1>

        <p className="mt-5 text-lg text-ink-body">
          The link might be old, or the page moved. Everything is on the home
          page.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href="/"
            className="bg-ink px-6 py-3 text-sm text-paper transition-colors duration-150 ease-out hover:bg-accent active:scale-[0.98]"
          >
            Back to the home page
          </a>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 text-sm text-ink-body transition-colors duration-150 ease-out hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
            <span className="link-underline">Go back</span>
          </button>
        </div>
      </div>
    </main>
  );
}
