"use client";

import { Spinner } from "@/components/ui/spinner";
import { useT } from "@/features/i18n/language-provider";

export function SubmittingStep() {
    const t = useT();
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <Spinner className="size-12 border-[3px]" label={t.submitting.heading} />
            <div className="space-y-2 animate-fade-up motion-reduce:animate-none">
                <h2 className="font-display text-2xl font-medium tracking-tight">{t.submitting.heading}</h2>
                <p className="max-w-sm text-ink-muted">{t.submitting.subtext}</p>
            </div>
        </div>
    );
}
