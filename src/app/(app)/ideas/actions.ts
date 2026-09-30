"use server";

import { createIdea } from "@/lib/dal/ideas";
import { requireSession } from "@/lib/dal/session";

// NFR-5: every Server Action returns this discriminated union. `error` is
// always short, display-ready copy from a small fixed set -- never a raw
// exception message.
export type SubmitIdeaResult =
  | { ok: true; data: null }
  | { ok: false; error: string };

const SUBMIT_FAILED_ERROR = "Couldn't submit. Check your connection and try again.";

export async function submitIdea(
  _prevState: SubmitIdeaResult | null,
  formData: FormData,
): Promise<SubmitIdeaResult> {
  // The DAL's authoritative guard (AD-2, AD-7) -- rejects (redirects) before
  // any DAL write runs for an unauthenticated caller.
  const session = await requireSession();

  const title = formData.get("title");
  const description = formData.get("description");

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    title.length === 0 ||
    description.length === 0
  ) {
    return { ok: false, error: SUBMIT_FAILED_ERROR };
  }

  try {
    await createIdea({ title, description }, session);
  } catch (error) {
    // The real cause is server-logged only; the client only ever sees the
    // fixed, display-ready copy above (NFR-5).
    console.error("[submitIdea] create failed", error);
    return { ok: false, error: SUBMIT_FAILED_ERROR };
  }

  return { ok: true, data: null };
}
