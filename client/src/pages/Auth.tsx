import { useState } from "react";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Auth() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Welcome back");
      await utils.auth.me.invalidate();
      setLocation("/");
    },
    onError: (e) => toast.error(e.message),
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success("Account created");
      await utils.auth.me.invalidate();
      setLocation("/");
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ name, email, password });
  };

  return (
    <div className="aurelia-site auth-page">
      <SiteHeader />
      <main>
        <section className="auth-card">
          <p className="eyebrow">UKIZ · {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</p>
          <h1>
            {mode === "login" ? (
              <>
                Welcome <em>back.</em>
              </>
            ) : (
              <>
                Join <em>UKIZ.</em>
              </>
            )}
          </h1>
          <p>{mode === "login" ? "Sign in with your email and password." : "Create your scent archive in seconds."}</p>

          <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
            {mode === "register" && (
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: "12px 14px", border: "1px solid #dde4e0", borderRadius: 8 }}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "12px 14px", border: "1px solid #dde4e0", borderRadius: 8 }}
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: "12px 14px", border: "1px solid #dde4e0", borderRadius: 8 }}
            />
            <button
              type="submit"
              disabled={login.isPending || register.isPending}
              style={{
                padding: "12px 14px",
                background: "#15231f",
                color: "#fff",
                borderRadius: 8,
                border: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
              {login.isPending || register.isPending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={16} />
            </button>
          </form>

          <button
            className="auth-card__quiet"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            style={{ marginTop: 14, background: "none", border: 0, color: "#2f6e5b", cursor: "pointer" }}
          >
            {mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>

          <button className="auth-card__quiet" onClick={() => setLocation("/admin")} style={{ marginTop: 8, background: "none", border: 0, cursor: "pointer" }}>
            Admin? Go to admin login →
          </button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
