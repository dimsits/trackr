import AppHeader from "./AppHeader";

/**
 * Owns the viewport height for authenticated routes: a fixed-height header
 * and a content region that fills exactly the remaining space. Pages decide
 * whether they scroll (workspace chooser) or fill it (board).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only rounded-control bg-surface px-4 py-2 text-sm font-semibold text-text shadow-raised focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50"
      >
        Skip to content
      </a>
      <AppHeader />
      <main id="main-content" tabIndex={-1} className="relative min-h-0 flex-1 overflow-y-auto outline-none">
        {children}
      </main>
    </div>
  );
}
