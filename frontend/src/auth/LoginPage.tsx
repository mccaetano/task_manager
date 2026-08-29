import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "./AuthContext";
import { ApiError } from "../api/http";
import "./AuthPages.css";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/tasks", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nao foi possivel entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFrame>
      <section className="auth-card" aria-labelledby="login-title">
        <h2 id="login-title">Entrar</h2>
        <p>Use seu e-mail e senha para acessar seu fluxo de tarefas.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button primary" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="auth-switch">
          Ainda nao tem conta? <Link to="/register">Criar cadastro</Link>
        </p>
      </section>
    </AuthFrame>
  );
}

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand-mark">TM</div>
        <div>
          <h1>Organize o trabalho sem perder o ritmo.</h1>
          <p>Um quadro direto, fluido e autenticado para acompanhar tarefas do inicio ao fechamento.</p>
          <div className="auth-palette" aria-hidden="true">
            <span style={{ background: "#869BF6" }} />
            <span style={{ background: "#0E5BBD" }} />
            <span style={{ background: "#929684" }} />
            <span style={{ background: "#D27F36" }} />
            <span style={{ background: "#6B9AD5" }} />
          </div>
        </div>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
