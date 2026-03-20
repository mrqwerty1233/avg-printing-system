"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel?: string;
  pendingLabel?: string;
};

export function SubmitButton({
  idleLabel = "Submit",
  pendingLabel = "Submitting...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}