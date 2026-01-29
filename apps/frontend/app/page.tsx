import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-lg font-semibold">Trackr</div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm hover:bg-zinc-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-block rounded-full border px-3 py-1 text-xs">
              Job & OJT application tracker
            </span>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Track every application in one clean pipeline.
            </h1>

            <p className="max-w-xl text-base text-zinc-600 md:text-lg">
              Trackr helps you manage job or OJT applications with a simple
              Kanban-style board. Stages, notes, tasks, and files — no CRM bloat.
            </p>

            <div className="flex gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border px-6 py-3 text-sm font-medium hover:bg-zinc-100"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl border bg-zinc-50 p-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="mb-4 flex justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    Personal Workspace
                  </div>
                  <div className="text-xs text-zinc-500">
                    Default pipeline
                  </div>
                </div>
                <div className="text-xs text-zinc-500">Today</div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {["Interested", "Applied", "Interview"].map((stage) => (
                  <div
                    key={stage}
                    className="rounded-2xl border bg-zinc-50 p-3"
                  >
                    <div className="mb-2 flex justify-between text-xs font-semibold">
                      <span>{stage}</span>
                      <span className="text-zinc-500">2</span>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-xl border bg-white p-2">
                        <div className="text-xs font-medium">ACME Corp</div>
                        <div className="text-xs text-zinc-500">
                          Software Intern
                        </div>
                      </div>
                      <div className="rounded-xl border bg-white p-2">
                        <div className="text-xs font-medium">Nimbus</div>
                        <div className="text-xs text-zinc-500">
                          Frontend Dev
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Preview only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold">
            Built for focus, not clutter
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Visual pipeline", "Move applications across stages easily."],
              ["Notes & activity log", "Keep interview context attached."],
              ["Tasks & reminders", "Never miss a follow-up."],
              ["File attachments", "Resumes and screenshots per application."],
              ["Fast & lightweight", "No unnecessary CRM features."],
              ["Personal-first", "Designed for individual workflows."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border bg-white p-5"
              >
                <div className="mb-1 text-sm font-semibold">{title}</div>
                <div className="text-sm text-zinc-600">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border bg-zinc-50 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">
                  Ready to get organized?
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Create your workspace and start tracking applications today.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border px-6 py-3 text-sm font-medium hover:bg-zinc-100"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:justify-between">
          <span className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Trackr
          </span>
          <div className="flex gap-4 text-sm text-zinc-500">
            <Link href="/login" className="hover:text-black">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-black">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
