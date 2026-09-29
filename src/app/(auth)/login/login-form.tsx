"use client";

import { useActionState, useState } from "react";

import { login } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);
  const [username, setUsername] = useState("");
  const error = state && !state.ok ? state.error : null;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-sm font-medium text-text-dark-secondary"
        >
          Username
        </label>
        {/* Controlled, independently of the Server Action's return value, so
            it retains its entered value across a failed submission
            (EXPERIENCE.md: "Fields retain entered username") regardless of
            how the action's round trip affects uncontrolled form state. */}
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="e.g. priya.n"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-describedby={error ? "login-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="h-12 rounded-[10px] border border-border-default bg-bg-page px-3.5 text-base text-text-primary outline-none focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-text-dark-secondary"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-describedby={error ? "login-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="h-12 rounded-[10px] border border-border-default bg-bg-page px-3.5 text-base text-text-primary outline-none focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20"
        />
      </div>
      {error ? (
        <p
          id="login-error"
          role="alert"
          className="rounded-[10px] bg-error-bg-dark px-3.5 py-2.5 text-sm font-medium text-error-dark"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-[10px] bg-brand-primary text-base font-medium text-text-inverse transition-colors hover:bg-brand-primary-hover disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
