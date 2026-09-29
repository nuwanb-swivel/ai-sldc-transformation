import type { Metadata } from "next";

import { AppIcon } from "@/app/app-icon";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — TeamPulse",
};

// The product's one deliberate dark/photo treatment (DESIGN.md "Login Screen
// (dark treatment)") -- every other screen stays on the light, flat system.
// Photo per the live design (design/ux-design.pen, Login > BackgroundPhoto):
// Unsplash photo by Vitaly Gariev (@silverkblack), 65% opacity, 380px band,
// matching DESIGN.md's login-screen.background-photo-opacity/height tokens.
export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-dark">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[380px] bg-cover bg-center opacity-65"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1758691737278-3af15b37af48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3OTA1OTk2NDB8&ixlib=rb-4.1.0&q=80&w=1080')",
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
