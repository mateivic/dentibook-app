"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  updateShowPrices,
  type UpdateSettingsResult,
} from "../actions/settings";

interface SettingsFormProps {
  showPrices: boolean;
}

export function SettingsForm({
  showPrices: initialShowPrices,
}: SettingsFormProps) {
  const [showPrices, setShowPrices] = useState(initialShowPrices);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<UpdateSettingsResult | null>(null);

  function save() {
    startTransition(async () => {
      setResult(await updateShowPrices(showPrices));
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <label className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
        <span>
          <span className="block font-medium">Show prices on booking site</span>
        </span>
        <input
          type="checkbox"
          checked={showPrices}
          onChange={(e) => {
            setShowPrices(e.target.checked);
            setResult(null);
          }}
          className="mt-1 h-4 w-4 accent-brand"
        />
      </label>

      {result?.ok === false && result.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      )}
      {result?.ok === true && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Saved.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
