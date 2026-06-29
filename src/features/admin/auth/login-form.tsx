"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthAction } from "./use-auth-action";
import type { BoundAuthAction } from "./types";

interface LoginFormProps {
  subdomain: string;
  signInAction: BoundAuthAction;
  resetAction: BoundAuthAction;
}

export function LoginForm({
  subdomain,
  signInAction,
  resetAction,
}: LoginFormProps) {
  const signIn = useAuthAction(signInAction);
  const reset = useAuthAction(resetAction);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <Card className="w-full">
        <h1 className="text-xl font-semibold">Admin sign-in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in with your admin email and password for {subdomain}.
        </p>

        {signIn.state?.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {signIn.state.error}
          </p>
        )}
        {reset.state?.ok && (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Reset link sent. Check your inbox.
          </p>
        )}

        <form action={signIn.formAction} className="mt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={signIn.pending}>
            {signIn.pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <form action={reset.formAction} className="mt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-ink-muted hover:text-ink">
              Forgot password?
            </summary>
            <div className="mt-3 space-y-2">
              <Label htmlFor="reset-email">Your email</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                required
              />
              {reset.state?.error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {reset.state.error}
                </p>
              )}
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={reset.pending}
              >
                {reset.pending ? "Sending…" : "Send reset link"}
              </Button>
            </div>
          </details>
        </form>
      </Card>
    </main>
  );
}
