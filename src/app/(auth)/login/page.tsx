import type { Metadata } from "next";

import { AppIcon } from "@/app/app-icon";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — TeamPulse",
};

// The product's one deliberate dark/photo treatment (DESIGN.md "Login Screen
// (dark treatment)") -- every other screen stays on the light, flat system.
// No approved photo asset exists yet, so per DESIGN.md's own implementation
// note ("swap for a real/approved team photo, or replace with an
// abstract/brand pattern if no photo is approved for use") this renders an
// abstract brand-toned gradient in the photo's place; the opacity/gradient
// treatment carries over unchanged.
export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-dark">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[380px] opacity-65"
        style={{
          background:
            "radial-gradient(120% 100% at 15% 0%, #5B5CF6 0%, #2A2C6B 45%, #111318 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[380px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(17,19,24,0.25) 0%, rgba(17,19,24,0.69) 50%, #111318 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-8 px-5 py-16">
        <div className="flex flex-col gap-3 pt-16">
          <AppIcon className="h-10 w-10 text-brand-primary" />
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-inverse">
            TeamPulse
          </h1>
          <p className="text-[15px] text-text-dark-secondary">
            Sign in to share and back ideas.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
