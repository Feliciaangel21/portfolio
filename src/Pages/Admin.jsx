import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "../supabase";
import { ADMIN_EMAIL } from "../config";
import AdminProjects from "../components/AdminProjects";
import AdminCertificates from "../components/AdminCertificates";
import AdminExperience from "../components/AdminExperience";
import { Field, Input, Button, Status } from "../components/admin/AdminUI";

const TABS = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "certificates", label: "Certificates" },
];

const PANELS = {
  projects: AdminProjects,
  experience: AdminExperience,
  certificates: AdminCertificates,
};

export default function Admin() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(ADMIN_EMAIL || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ kind: "info", message: "" });
  const [tab, setTab] = useState("projects");
  const ActivePanel = PANELS[tab] || AdminProjects;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ kind: "info", message: "" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setStatus(
      error ? { kind: "error", message: error.message } : { kind: "info", message: "Signed in." }
    );
    setBusy(false);
  };

  if (!session) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-surface px-5">
        <form onSubmit={signIn} className="w-full max-w-sm border border-rule bg-paper p-7">
          <h1 className="text-2xl text-ink">Portfolio admin</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to manage your work.</p>

          <div className="mt-6 space-y-4">
            <Field label="Email" htmlFor="admin-email">
              <Input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Password" htmlFor="admin-password">
              <Input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </div>

          <div className="mt-6 space-y-3">
            <Button variant="primary" type="submit" disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <Status status={status} />
          </div>
        </form>
      </main>
    );
  }

  const isAllowed = !ADMIN_EMAIL || session.user.email?.toLowerCase() === ADMIN_EMAIL;
  if (!isAllowed) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-surface px-5 text-center">
        <div>
          <p className="text-lg text-ink">This account cannot manage the portfolio.</p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="link-underline mt-4 text-sm text-ink-body hover:text-accent"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-surface pb-16">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl text-ink">Portfolio admin</h1>
            <p className="text-meta text-ink-muted">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="link-underline text-sm text-ink-body hover:text-accent"
            >
              View site
            </a>
            <Button onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-6">
          <div role="tablist" aria-label="Admin sections" className="flex gap-6">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`-mb-px border-b-2 pb-3 pt-1 font-mono text-meta uppercase transition-colors duration-150 ease-out ${
                  tab === id
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 pt-6">
        <ActivePanel />
      </div>
    </main>
  );
}
