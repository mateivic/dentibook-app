"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "./language-provider";

interface LanguageSwitcherProps {
    className?: string;
}

// Compact language toggle. Inherits the surrounding text color (so it works on
// both the dark hero and the light wizard). Hidden when only one language is on.
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { language, setLanguage, availableLanguages } = useLanguage();
    if (availableLanguages.length < 2) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-1 text-xs font-medium uppercase tracking-wider",
                className,
            )}
        >
            {availableLanguages.map((lang, i) => (
                <span key={lang} className="flex items-center gap-1">
                    {i > 0 && <span className="opacity-40">/</span>}
                    <button
                        type="button"
                        onClick={() => setLanguage(lang)}
                        aria-pressed={lang === language}
                        className={cn(
                            "rounded px-1 py-0.5 transition-opacity",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
                            lang === language
                                ? "underline underline-offset-4 opacity-100"
                                : "opacity-60 hover:opacity-100",
                        )}
                    >
                        {lang}
                    </button>
                </span>
            ))}
        </div>
    );
}
