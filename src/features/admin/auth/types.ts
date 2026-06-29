// Result returned by the admin auth server actions and consumed by the
// `useAuthAction` client hook. `redirectTo` triggers a full-document
// navigation (see use-auth-action.ts for why a hard nav is required).
export interface ActionResult {
  error?: string;
  redirectTo?: string;
  ok?: boolean;
}

// Shape of an auth server action after `subdomain` (and any other leading
// args) have been bound — i.e. the `(prevState, formData)` form that
// `useActionState` expects.
export type BoundAuthAction = (
  prevState: ActionResult | null,
  formData: FormData,
) => Promise<ActionResult>;
