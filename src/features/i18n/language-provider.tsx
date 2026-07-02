"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import type { TenantConfig } from "@/lib/supabase/types";
import type { Dictionary } from "./dictionaries/dictionary";
import { hr } from "./dictionaries/hr";
import { en } from "./dictionaries/en";

const DICTIONARIES: Record<string, Dictionary> = { hr, en };
const DEFAULT_LANGUAGE = "hr";

// A tiny external store over localStorage. Using useSyncExternalStore (instead
// of useState + an effect) lets us read the persisted choice on the client
// without setState-in-effect, stays SSR-safe, and syncs across tabs.
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}

function storageKey(tenantId: string) {
    return `lang:${tenantId}`;
}

function readStored(tenantId: string): string | null {
    try {
        return window.localStorage.getItem(storageKey(tenantId));
    } catch {
        return null;
    }
}

interface LanguageContextValue {
    language: string;
    setLanguage: (lang: string) => void;
    availableLanguages: string[];
    t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
    tenantId: string;
    config: TenantConfig;
    children: ReactNode;
}

export function LanguageProvider({
    tenantId,
    config,
    children,
}: LanguageProviderProps) {
    const lang = config.lang;

    // Languages enabled in tenant config, narrowed to those we actually ship.
    const availableLanguages = useMemo(() => {
        const configured = lang?.languages?.length
            ? lang.languages
            : [DEFAULT_LANGUAGE];
        const supported = configured.filter((l) => l in DICTIONARIES);
        return supported.length ? supported : [DEFAULT_LANGUAGE];
    }, [lang]);

    const initialLanguage = useMemo(() => {
        const preferred = lang?.defaultLanguage;
        if (preferred && availableLanguages.includes(preferred)) return preferred;
        return availableLanguages[0];
    }, [lang, availableLanguages]);

    // Persisted choice (null on the server / before any selection).
    const stored = useSyncExternalStore(
        subscribe,
        () => readStored(tenantId),
        () => null,
    );
    const language =
        stored && availableLanguages.includes(stored) ? stored : initialLanguage;

    // Keep <html lang> in sync with the active language.
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = useCallback(
        (lang: string) => {
            if (!availableLanguages.includes(lang)) return;
            try {
                window.localStorage.setItem(storageKey(tenantId), lang);
            } catch {
                // Ignore storage failures (private mode, etc.).
            }
            emit();
        },
        [availableLanguages, tenantId],
    );

    const value = useMemo<LanguageContextValue>(
        () => ({
            language,
            setLanguage,
            availableLanguages,
            t: DICTIONARIES[language] ?? DICTIONARIES[DEFAULT_LANGUAGE],
        }),
        [language, setLanguage, availableLanguages],
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error("useLanguage must be used inside LanguageProvider");
    }
    return ctx;
}

export function useT(): Dictionary {
    return useLanguage().t;
}
