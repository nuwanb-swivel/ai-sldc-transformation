import { requireSession } from "@/lib/dal/session";

// Minimal authenticated placeholder -- Epic 2's idea board is out of scope
// for this story.
export default async function AppHomePage() {
  const { user } = await requireSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-2 px-5 text-center">
      <h1 className="text-2xl font-semibold text-text-primary">
        You&apos;re signed in.
      </h1>
      <p className="text-base text-text-secondary">
        Welcome back, {user.displayUsername ?? user.username}.
      </p>
    </main>
  );
}
