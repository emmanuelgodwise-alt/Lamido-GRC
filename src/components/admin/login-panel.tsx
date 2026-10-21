"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, field, fieldLabel } from "@/lib/styles";
import { site } from "@/lib/site";

/**
 * Administrator sign-in. Supabase Auth email/password — there is no public
 * self-registration anywhere; accounts are created by the owner in the
 * Supabase dashboard (docs/admin-onboarding.md).
 */
export function LoginPanel({
  onSignIn,
  onRecovery,
}: {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onRecovery: (email: string) => Promise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const message = await onSignIn(email.trim(), password);
    if (message) setError(message);
    setBusy(false);
  };

  const requestRecovery = async () => {
    if (!email.trim()) {
      setError("Enter your administrator email above first, then use the reset link.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const message = await onRecovery(email.trim());
    if (message) setError(message);
    else
      setNotice(
        "If the address belongs to an administrator account, a password-reset email has been sent (check spam folders).",
      );
    setBusy(false);
  };

  return (
    <div className={cn(card, "mx-auto w-full max-w-md p-6 sm:p-8")}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/[0.06]">
          <Lock className="h-5 w-5 text-navy" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">
            Administrator sign-in
          </h1>
          <p className="text-xs text-ink/65">{site.name} internal area</p>
        </div>
      </div>

      <form className="mt-7 space-y-5" onSubmit={submit}>
        <div>
          <label htmlFor="admin-email" className={fieldLabel}>
            Email<span className="text-destructive"> *</span>
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            className={cn(field, "mt-1.5")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="admin-password" className={fieldLabel}>
            Password<span className="text-destructive"> *</span>
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            className={cn(field, "mt-1.5")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/[0.06] p-3 text-sm text-ink/80"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-lg border border-gold/40 bg-gold/[0.08] p-3 text-sm text-ink/80"
          >
            {notice}
          </p>
        )}

        <button type="submit" disabled={busy} className={cn(btn("primary", "w-full"), busy && "cursor-wait opacity-70")}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={requestRecovery}
        disabled={busy}
        className="mt-4 flex min-h-11 w-full items-center justify-center text-center text-sm font-medium text-ink/65 underline underline-offset-4 transition-colors hover:text-navy"
      >
        Forgot the administrator password?
      </button>

      <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink/65">
        Access is provisioned manually by the company — there is no public
        registration. Administrators must never share credentials.{" "}
        <Link href="/" className="underline underline-offset-2 hover:text-navy">
          Return to the public site
        </Link>
        .
      </p>
    </div>
  );
}
