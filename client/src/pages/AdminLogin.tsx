import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShieldAlert, LogIn } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("admin@ukiz.com");
  const [password, setPassword] = useState("admin123");

  const login = trpc.auth.adminLogin.useMutation({
    onSuccess: async () => {
      toast.success("Admin signed in");
      await utils.auth.me.invalidate();
      setLocation("/admin");
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f7f6", padding: 16 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #dde4e0", borderRadius: 12, padding: 28, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#15231f" }}>
          <ShieldAlert size={22} />
          <strong style={{ letterSpacing: ".08em" }}>UKIZ ADMIN</strong>
        </div>
        <p style={{ margin: 0, color: "#698077", fontSize: 13 }}>Sign in with your admin email and password.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@ukiz.com"
          required
          style={{ padding: "12px 14px", border: "1px solid #dde4e0", borderRadius: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ padding: "12px 14px", border: "1px solid #dde4e0", borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={login.isPending}
          style={{ padding: "12px 14px", background: "#15231f", color: "#fff", borderRadius: 8, border: 0, display: "flex", gap: 8, justifyContent: "center", alignItems: "center", cursor: "pointer" }}
        >
          <LogIn size={16} /> {login.isPending ? "Signing in…" : "Sign in as admin"}
        </button>
        <small style={{ color: "#8fa49b" }}>
          Default: <b>admin@ukiz.com / admin123</b> — override via <code>ADMIN_EMAIL</code> / <code>ADMIN_PASSWORD</code> in <code>.env</code>
        </small>
        <button type="button" onClick={() => setLocation("/")} style={{ background: "none", border: 0, color: "#2f6e5b", cursor: "pointer" }}>
          ← Back to storefront
        </button>
      </form>
    </div>
  );
}
