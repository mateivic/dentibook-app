"use client";

import { useActionState, useEffect } from "react";
import type { ActionResult, BoundAuthAction } from "./types";

// Wraps an auth server action with `useActionState` and performs a full-page
// navigation when the action returns `redirectTo`.
//
// A hard navigation (`window.location.assign`) is required — not a router
// push. The app rewrites `{sub}.host/admin` -> `/{sub}/admin` in proxy.ts,
// and that rewrite only runs on full document requests. A soft (SPA) redirect
// would resolve `[subdomain]` to the literal "admin" segment and render the
// tenant-404 page; the hard navigation re-enters the proxy and resolves the
// tenant correctly.
export function useAuthAction(action: BoundAuthAction) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  // Keep the UI in a loading state during the brief gap between a successful
  // action and the navigation actually starting.
  const navigating = Boolean(state?.redirectTo);

  return { state, formAction, pending: pending || navigating };
}
