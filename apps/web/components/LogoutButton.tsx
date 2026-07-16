"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      className="h-9 rounded-lg border border-slate-500/20 bg-slate-950/60 px-3 text-xs font-extrabold text-slate-200 transition hover:border-rose-200/30 hover:bg-rose-950/25 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isSigningOut}
      onClick={() => {
        setIsSigningOut(true);
        void signOut({ callbackUrl: "/" });
      }}
      type="button"
    >
      {isSigningOut ? "Logging out..." : "Logout"}
    </button>
  );
}
