import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function AuthPage() {
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        if (!form.username.trim()) { setError("El nombre de usuario es requerido"); return; }
        await register(form.username, form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setForm({ username: "", email: "", password: "" });
  };

  return (
    <div className="auth-root">
      {/* ── Background grid decoration ── */}
      <div className="auth-grid" aria-hidden />

      {/* ── Brand mark ── */}
      <div className="auth-brand">
        <span className="auth-logo">G</span>
        <span className="auth-logo-text">GroupsApp</span>
        <span className="tag tag-accent mono">v1.0 · monolith</span>
      </div>

      {/* ── Card ── */}
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">
            {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
          </h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Ingresa tus credenciales para continuar"
              : "Únete a GroupsApp para empezar a chatear"}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="input-group" style={{ animation: "slideUp 200ms both" }}>
              <label className="input-label">Usuario</label>
              <input
                className="input"
                type="text"
                placeholder="tu_usuario"
                value={form.username}
                onChange={set("username")}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={set("email")}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : mode === "login" ? "Ingresar" : "Registrarse"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <button className="auth-toggle-btn" onClick={toggle} type="button">
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </div>
      </div>

      {/* ── Bottom decoration ── */}
      <div className="auth-footer">
        <span className="mono" style={{ color: "var(--text-muted)", fontSize: 11 }}>
          ST0263 · Sistemas Distribuidos · 2026-1
        </span>
      </div>
    </div>
  );
}
