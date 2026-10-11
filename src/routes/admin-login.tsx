import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

const ADMIN_PASSWORD = "orbit2024";

function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "1");
      navigate({ to: "/admin/reel" });
    } else {
      setError("Wrong password.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", padding: "2rem", borderRadius: "8px", width: "320px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: "1.2rem" }}>Admin Login</h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: "0.6rem", borderRadius: "4px", border: "1px solid #333", background: "#111", color: "#fff", fontSize: "1rem" }}
          autoFocus
        />
        {error && <p style={{ color: "#f55", margin: 0, fontSize: "0.85rem" }}>{error}</p>}
        <button type="submit" style={{ padding: "0.6rem", background: "#e50914", border: "none", borderRadius: "4px", color: "#fff", fontSize: "1rem", cursor: "pointer" }}>
          Enter
        </button>
      </form>
    </div>
  );
}
