import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS } from "@/lib/users";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const success = login(email, password);
    if (success) {
      navigate({ to: "/dashboard" });
    } else {
      setError("Invalid email or password. Please try again.");
    }
    setIsLoading(false);
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("demo123");
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 scanline" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-toxic animate-pulse-glow" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-gradient-toxic">Carbon Ledger</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to access your carbon dashboard</p>
          </div>

          {/* Login Form */}
          <div className="rounded-2xl border border-border bg-card/70 p-8 backdrop-blur">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-md border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-toxic focus:outline-none"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-toxic focus:outline-none"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md gradient-toxic px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-toxic transition disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Quick Login (Demo Accounts)
              </p>
              <div className="space-y-2">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => quickLogin(user.email)}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-background/40 px-4 py-2.5 text-left font-mono text-xs transition hover:border-toxic/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-toxic font-mono text-[10px] font-bold text-primary-foreground">
                      {user.avatarSeed}
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-toxic">{user.tier}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-toxic">
              ← Back to Carbon Score
            </Link>
          </div>

          <div className="mt-4 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            All passwords are "demo123"
          </div>
        </div>
      </div>
    </main>
  );
}
