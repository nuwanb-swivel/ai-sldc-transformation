import { requireSession } from "@/lib/dal/session";

import { AddIdeaOverlay } from "./add-idea-overlay";

// The authenticated shell. `requireSession()` is the DAL's authoritative
// guard (AD-2, AD-7) -- independent of `proxy.ts`'s optimistic redirect.
// This session lookup is a genuine async gap backed by `src/app/loading.tsx`
// (see that file's comment). The persistent Add Idea trigger + overlay
// render here so they're reachable from every authenticated screen (AC1).
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireSession();

  return (
    <div className="min-h-screen bg-bg-page">
      {children}
      <AddIdeaOverlay />
    </div>
  );
}
