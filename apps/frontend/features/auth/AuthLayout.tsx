import { ArrowLeft, ArrowRight, Columns3, ListChecks, UserRound } from "lucide-react";
import Link from "next/link";
import Logo, { LogoMark } from "@/components/brand/Logo";
import ApplicationCardContent from "@/features/board/ApplicationCardContent";

const points = [
  { icon: <Columns3 aria-hidden="true" />, text: "One visual pipeline for every application" },
  { icon: <ListChecks aria-hidden="true" />, text: "Notes, follow-up tasks and files beside each one" },
  { icon: <UserRound aria-hidden="true" />, text: "Built for your own search, not a sales team" },
];

/** Shared frame for sign-in and registration: brand context on desktop, form-first on mobile. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-ink px-10 py-10 text-on-brand lg:flex xl:px-14">
        <Link href="/" className="inline-flex w-fit items-center gap-2.5 rounded-control" aria-label="Trackr home">
          <LogoMark tone="inverse" />
          <span className="text-[17px] font-extrabold tracking-[-0.02em]">Trackr</span>
        </Link>

        <div className="max-w-md">
          <p className="text-3xl font-extrabold leading-tight tracking-tight xl:text-[34px]">
            Your search, moving calmly forward.
          </p>
          <p className="mt-3 text-[15px] leading-7 text-on-brand/75">
            Keep every job and OJT application in one place, and always know what to do next.
          </p>

          {/* A quiet vignette of the board: one card moving to the next stage. */}
          <div aria-hidden="true" className="mt-10 grid grid-cols-2 gap-3">
            {[
              { stage: "Applied", count: 4 },
              { stage: "Interview", count: 2 },
            ].map((lane, index) => (
              <div key={lane.stage} className="rounded-card bg-on-brand/10 p-2.5">
                <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold">
                  <span className="size-2 rounded-full bg-on-brand/70" />
                  {lane.stage}
                  <span className="ml-auto text-on-brand/60">{lane.count}</span>
                </div>
                <div className="rounded-card bg-surface text-text shadow-raised">
                  <ApplicationCardContent
                    application={
                      index === 0
                        ? { company: "Northfield Labs", role: "Product Design Intern", location: "Remote", source: null, priority: "HIGH", status: "ACTIVE", compMin: null, compMax: null }
                        : { company: "Harbor & Pine", role: "Junior Frontend Developer", location: "Makati", source: null, priority: "MEDIUM", status: "ACTIVE", compMin: null, compMax: null }
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-on-brand/70">
            Applied <ArrowRight aria-hidden="true" className="size-3.5" /> Interview, logged automatically
          </p>
        </div>

        <ul className="space-y-3">
          {points.map((point) => (
            <li key={point.text} className="flex items-center gap-3 text-sm font-medium text-on-brand/85 [&_svg]:size-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-on-brand/10">{point.icon}</span>
              {point.text}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-h-dvh flex-col px-4 py-5 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="rounded-control lg:hidden" aria-label="Trackr home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-semibold text-text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to home
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">{children}</main>
      </div>
    </div>
  );
}
