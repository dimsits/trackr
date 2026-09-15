import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui/Button";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-canvas">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="rounded-control" aria-label="Trackr home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-semibold text-text-muted">
            <li>
              <a href="#how-it-works" className="rounded-control px-3 py-2 transition-colors duration-150 hover:bg-surface-muted hover:text-text">
                How it works
              </a>
            </li>
            <li>
              <a href="#principles" className="rounded-control px-3 py-2 transition-colors duration-150 hover:bg-surface-muted hover:text-text">
                Principles
              </a>
            </li>
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Sign in
          </Link>
          <Link href="/register" className={buttonStyles({ size: "sm" })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
