"use client";

import { useTransition } from "react";
import type { ActionResult } from "./types";

interface SignOutButtonProps {
  signOutAction: () => Promise<ActionResult>;
}

export function SignOutButton({ signOutAction }: SignOutButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const { redirectTo } = await signOutAction();
      if (redirectTo) window.location.assign(redirectTo);
    });
  }

  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        disabled={pending}
        className="text-ink-muted hover:text-ink disabled:opacity-50"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
