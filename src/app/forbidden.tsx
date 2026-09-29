// Renders when `requireAdmin()` calls `next/navigation`'s `forbidden()`
// (requires `experimental.authInterrupts` in `next.config.ts`).
export default function Forbidden() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-2 px-5 text-center">
      <h1 className="text-2xl font-semibold text-text-primary">
        You don&apos;t have access to this page.
      </h1>
      <p className="text-base text-text-secondary">
        This area is limited to Admins.
      </p>
    </main>
  );
}
