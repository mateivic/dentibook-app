"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useT } from "@/features/i18n/language-provider";
import { confirmCancellation } from "../actions/cancel";

interface CancelFormProps {
    token: string;
    subdomain: string;
}

// Submit button reads the parent <form>'s pending state, so it must live inside
// the form. While the cancellation server action runs (and until it redirects)
// it shows a spinner and disables itself.
function SubmitButton() {
    const { pending } = useFormStatus();
    const t = useT();
    return (
        <Button type="submit" variant="destructive" disabled={pending} aria-busy={pending}>
            {pending ? (
                <>
                    <Spinner className="border-white/40 border-t-white" label={t.cancel.confirming} />
                    <span className="ml-2">{t.cancel.confirming}</span>
                </>
            ) : (
                t.cancel.confirm
            )}
        </Button>
    );
}

export function CancelForm({ token, subdomain }: CancelFormProps) {
    const t = useT();
    return (
        <form action={confirmCancellation} className="flex justify-center gap-3">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="subdomain" value={subdomain} />
            <SubmitButton />
            <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-brand px-4 text-sm font-medium text-ink transition hover:bg-surface-muted"
            >
                {t.cancel.keep}
            </Link>
        </form>
    );
}
