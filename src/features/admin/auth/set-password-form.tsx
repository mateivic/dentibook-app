"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthAction } from "./use-auth-action";
import type { BoundAuthAction } from "./types";

interface SetPasswordFormProps {
  setPasswordAction: BoundAuthAction;
}

export function SetPasswordForm({ setPasswordAction }: SetPasswordFormProps) {
  const { state, formAction, pending } = useAuthAction(setPasswordAction);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <Card className="w-full">
        <h1 className="text-xl font-semibold">Set your password</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Choose a password to finish setting up your admin account.
        </p>

        {state?.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save password"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
