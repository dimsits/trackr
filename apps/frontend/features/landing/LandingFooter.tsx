import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-text-muted">A calm tracker for job and OJT applications.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-text-muted">
            <li>
              <a href="#how-it-works" className="rounded-sm hover:text-text">
                How it works
              </a>
            </li>
            <li>
              <Link href="/login" className="rounded-sm hover:text-text">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/register" className="rounded-sm hover:text-text">
                Create account
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-8 text-xs text-text-muted sm:px-6">© {new Date().getFullYear()} Trackr</div>
    </footer>
  );
}
