import { requireSession } from "@/lib/dal/session";

// The authenticated shell. `requireSession()` is the DAL's authoritative
// guard (AD-2, AD-7) -- independent of `proxy.ts`'s optimistic redirect.
// This session lookup is a genuine async gap backed by `src/app/loading.tsx`
// (see that file's comment).
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireSession();

  return <div className="min-h-screen bg-bg-page">{children}</div>;
}
