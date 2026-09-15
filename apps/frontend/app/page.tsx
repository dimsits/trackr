import { ArrowRight, Route, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import LandingFooter from "@/features/landing/LandingFooter";
import LandingHeader from "@/features/landing/LandingHeader";
import ProductPreview from "@/features/landing/ProductPreview";
import ProofSections from "@/features/landing/ProofSections";

const principles = [
  {
    icon: <Zap />,
    title: "Quick to update",
    body: "Adding an application takes a few fields. Moving it forward is one drag.",
  },
  {
    icon: <UserRound />,
    title: "Personal-first",
    body: "Made for one person's search. No deals, quotas, seats or sales vocabulary.",
  },
  {
    icon: <Route />,
    title: "Opinionated, not rigid",
    body: "Sensible stages to start with, and room to shape pipelines around how you work.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden bg-[radial-gradient(70%_60%_at_50%_0%,var(--color-brand-soft)_0%,transparent_70%)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(40%_45%_at_85%_10%,var(--color-attention-soft)_0%,transparent_70%)] opacity-70"
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-muted shadow-xs">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                For job and OJT applications
              </p>
              <h1
                id="hero-heading"
                className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-text sm:text-5xl lg:text-[64px]"
              >
                Every application, in one calm pipeline.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
                Trackr turns a scattered search into a board you can read at a glance. Move applications through
                stages, and keep notes, follow-ups and files beside each one.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/register" className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}>
                  Start tracking
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/login" className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full sm:w-auto" })}>
                  Sign in
                </Link>
              </div>
              <p className="mt-5 text-[13px] font-medium text-text-muted">Personal-first · No CRM clutter · Works on your phone</p>
            </div>

            <div className="mt-14 sm:mt-16">
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* Product proof */}
        <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="max-w-2xl">
              <p className="text-[13px] font-bold text-brand">How it works</p>
              <h2 id="how-heading" className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
                Everything a search needs. Nothing a sales team does.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-text-muted sm:text-base">
                Trackr keeps the whole picture in four places you will actually use.
              </p>
            </div>
            <div className="mt-16 sm:mt-20">
              <ProofSections />
            </div>
          </div>
        </section>

        {/* Principles */}
        <section id="principles" aria-labelledby="principles-heading" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 id="principles-heading" className="max-w-xl text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
              Designed to stay out of your way
            </h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {principles.map((principle) => (
                <li key={principle.title} className="rounded-card border border-border bg-surface p-6 shadow-card">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-card bg-brand-soft text-brand [&_svg]:size-5"
                  >
                    {principle.icon}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-text">{principle.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-text-muted">{principle.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="overflow-hidden rounded-panel bg-brand-ink px-6 py-12 text-on-brand sm:px-12 sm:py-16">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 id="cta-heading" className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  Give your search a calmer shape.
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-on-brand/80">
                  Create a workspace, pick your stages, and add the applications already on your mind.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className={buttonStyles({ variant: "inverse", size: "lg" })}>
                  Create your account
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/login" className={buttonStyles({ variant: "inverse-ghost", size: "lg" })}>
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
