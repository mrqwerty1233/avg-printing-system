"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/logout/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
      className="rounded-xl bg-red-600 text-white px-4 py-2 font-medium hover:bg-red-700 transition disabled:opacity-70"
    >
      {isPending ? "Signing Out..." : "Logout"}
    </button>
  );
}