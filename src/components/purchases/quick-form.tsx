"use client";

import { useRef, useState } from "react";

type QuickFormProps = {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  children: React.ReactNode;
  buttonLabel: string;
  onSuccess?: () => void;
};

export function QuickForm({ action, children, buttonLabel, onSuccess }: QuickFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const result = await action(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error desconocido");
      return;
    }

    formRef.current?.reset();
    onSuccess?.();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : buttonLabel}
      </button>
    </form>
  );
}
