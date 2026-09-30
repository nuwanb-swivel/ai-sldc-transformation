import { z } from "zod";

import { db } from "@/lib/db";
import { idea } from "@/lib/db/schema";

import type { getSession } from "./session";

const createIdeaSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export type CreateIdeaInput = z.input<typeof createIdeaSchema>;

/**
 * The single authoritative write path for creating an idea (AD-2). Validates
 * non-empty `title`/`description` with Zod, then inserts with `status = new`
 * and the caller as submitter -- `upvote_count` is derived (always 0 for a
 * freshly created idea; there is no column for it, see schema.ts).
 */
export async function createIdea(
  input: CreateIdeaInput,
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
) {
  const { title, description } = createIdeaSchema.parse(input);

  const [row] = await db
    .insert(idea)
    .values({
      title,
      description,
      submitterId: session.user.id,
    })
    .returning();

  return row;
}
