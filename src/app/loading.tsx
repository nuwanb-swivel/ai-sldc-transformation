import { AppIcon } from "@/app/app-icon";

// Backs the real Suspense boundary created around the root layout's children
// by this file: `(app)/layout.tsx`'s `requireSession()` is a genuine async
// gap (a DB-backed session lookup), so this splash is a real loading state,
// not decorative (see spec Design Notes). No artificial min/max display
// time -- if the lookup is instant, this may never render.
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-bg-page">
      <div className="relative flex h-[200px] w-[200px] items-center justify-center">
        <span
          aria-hidden="true"
          className="loading-ring loading-ring--decorative absolute inset-0 rounded-full border-2 border-brand-primary"
        />
        <span
          aria-hidden="true"
          className="loading-ring loading-ring--decorative absolute inset-0 rounded-full border-2 border-brand-primary"
          style={{ animationDelay: "0.7s" }}
        />
        <span
          aria-hidden="true"
          className="loading-ring loading-ring--decorative absolute inset-0 rounded-full border-2 border-brand-primary"
          style={{ animationDelay: "1.4s" }}
        />
        {/* Reduced-motion fallback: a single static ring at ~40% opacity. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden rounded-full border-2 border-brand-primary opacity-40 motion-reduce:block"
        />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary-light">
          <AppIcon className="h-10 w-10 text-brand-primary" />
        </div>
      </div>
      <p className="text-[15px] font-medium text-text-secondary">
        Loading TeamPulse…
      </p>
    </div>
  );
}
