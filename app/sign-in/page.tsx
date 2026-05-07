"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);
      fd.set("flow", mode);
      if (mode === "signUp" && name) fd.set("name", name);
      await signIn("password", fd);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-[420px]">
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl tracking-tight">
          {mode === "signIn" ? "Welcome back" : "Make an account"}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {mode === "signIn"
            ? "Sign in to log and read café visits."
            : "Just an email and password — no fuss."}
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-[var(--color-line)] bg-[color:var(--color-surface)] p-6"
      >
        {mode === "signUp" && (
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
            />
          </label>
        )}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[var(--color-ink-soft)]">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-ink)]"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-[var(--color-clay)] bg-[var(--color-clay)]/10 px-4 py-2.5 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full rounded-full px-5 py-3 text-sm"
        >
          {busy ? "…" : mode === "signIn" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          className="block w-full text-center text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          {mode === "signIn" ? "No account yet? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
