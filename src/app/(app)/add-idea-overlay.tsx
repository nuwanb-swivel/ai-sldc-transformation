"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { submitIdea, type SubmitIdeaResult } from "./ideas/actions";

const initialState: SubmitIdeaResult | null = null;

// Fires when the swipe gesture on the sheet's grabber has moved down far
// enough to count as a dismiss (mobile-only; mirrors the mockup's
// swipe-down-to-dismiss affordance).
const SWIPE_DISMISS_THRESHOLD_PX = 80;

/**
 * The persistent "Add Idea" trigger + its overlay (sheet on mobile /
 * centered dialog on desktop), rendered in the authenticated shell's layout
 * so it's reachable from every screen (AC1). Built on a native `<dialog>` --
 * no overlay/dialog library is installed, and `showModal()`/`close()` give
 * focus trapping, `Esc` handling, and trigger-focus restoration for free.
 */
export function AddIdeaOverlay() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Identifies which "open session" of the dialog is current. Bumped every
  // time the overlay opens, and stamped onto each submission when it starts
  // so a success that resolves after the user has dismissed and reopened
  // the dialog (with new, unsaved content) doesn't silently close the
  // reopened session and discard that content.
  const generationRef = useRef(0);
  const submissionGenerationRef = useRef(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, formAction, pending] = useActionState(
    submitIdea,
    initialState,
  );

  const error = state && !state.ok ? state.error : null;
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  // On a successful submission, close silently -- no toast (AC2). The
  // dialog's own "close" handler below resets the fields. Skipped if the
  // dialog has since been closed and reopened (a new generation), since the
  // success belongs to a session that's no longer current.
  useEffect(() => {
    const isCurrentGeneration =
      submissionGenerationRef.current === generationRef.current;
    if (state?.ok && isCurrentGeneration) {
      dialogRef.current?.close();
    }
  }, [state]);

  function openOverlay() {
    generationRef.current += 1;
    dialogRef.current?.showModal();
  }

  function handleFormSubmit() {
    submissionGenerationRef.current = generationRef.current;
  }

  // Fires for every dismissal path (Esc, outside-tap via the backdrop click
  // handler below, swipe-down, and a successful submit's programmatic
  // close()) -- content is discarded silently and unconditionally in every
  // case (AC4), so a single reset here covers all of them.
  function handleDialogClose() {
    setTitle("");
    setDescription("");
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      dialogRef.current?.close();
    }
  }

  function handleGrabberTouchStart(event: React.TouchEvent) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleGrabberTouchMove(event: React.TouchEvent) {
    const startY = touchStartY.current;
    const currentY = event.touches[0]?.clientY;
    if (startY === null || currentY === undefined) return;

    if (currentY - startY > SWIPE_DISMISS_THRESHOLD_PX) {
      touchStartY.current = null;
      dialogRef.current?.close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openOverlay}
        className="fixed right-5 bottom-6 flex h-[52px] items-center gap-2 rounded-full bg-brand-primary px-5 text-base font-semibold text-text-inverse shadow-[0_4px_12px_rgba(16,18,24,0.15)] transition-colors hover:bg-brand-primary-hover sm:right-8"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        Add Idea
      </button>

      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        onClick={handleBackdropClick}
        aria-labelledby="add-idea-title"
        className="add-idea-dialog fixed inset-0 m-0 h-full max-h-[100dvh] w-full max-w-none border-0 bg-black/40 p-0 backdrop:bg-transparent open:flex open:flex-col open:justify-end sm:open:items-center sm:open:justify-center"
      >
        <div className="flex w-full flex-col gap-5 rounded-t-2xl bg-bg-page px-5 pt-3 pb-8 shadow-[0_-4px_32px_rgba(16,18,24,0.08)] sm:w-full sm:max-w-[420px] sm:rounded-2xl sm:pt-6 sm:pb-6 sm:shadow-[0_12px_32px_rgba(16,18,24,0.08)]">
          <div
            onTouchStart={handleGrabberTouchStart}
            onTouchMove={handleGrabberTouchMove}
            className="mx-auto flex w-full shrink-0 justify-center py-3 sm:hidden"
          >
            <div className="h-1 w-9 rounded-full bg-border-strong" />
          </div>

          <div className="flex items-center justify-between">
            <h2
              id="add-idea-title"
              className="text-lg font-semibold text-text-primary"
            >
              Add idea
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="flex h-6 w-6 items-center justify-center text-text-secondary"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2L14 14M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form
            action={formAction}
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="idea-title"
                className="text-sm font-medium text-text-secondary"
              >
                Title
              </label>
              <input
                id="idea-title"
                name="title"
                type="text"
                placeholder="Give the coffee machine a service rota"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-describedby={error ? "add-idea-error" : undefined}
                aria-invalid={error ? true : undefined}
                className="h-12 rounded-[10px] border border-border-default bg-bg-page px-3.5 text-base text-text-primary outline-none focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="idea-description"
                className="text-sm font-medium text-text-secondary"
              >
                Description
              </label>
              <textarea
                id="idea-description"
                name="description"
                rows={3}
                placeholder="It keeps breaking mid-morning and nobody owns fixing it. A weekly rota would spread the load."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                aria-describedby={error ? "add-idea-error" : undefined}
                aria-invalid={error ? true : undefined}
                className="min-h-24 resize-none rounded-[10px] border border-border-default bg-bg-page px-3.5 py-3 text-base text-text-primary outline-none focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20"
              />
            </div>

            {error ? (
              <p
                id="add-idea-error"
                role="alert"
                className="flex items-center gap-2 rounded-[10px] bg-error-bg px-3 py-2.5 text-sm font-medium text-error"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || pending}
              className="h-12 rounded-[10px] bg-brand-primary text-base font-semibold text-text-inverse transition-colors hover:bg-brand-primary-hover disabled:bg-bg-muted disabled:text-text-disabled"
            >
              {pending ? "Submitting…" : "Submit idea"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
