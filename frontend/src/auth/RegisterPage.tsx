import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { ApiError } from "../api/http";
import { useAuth } from "./AuthContext";
import { AuthFrame } from "./LoginPage";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/tasks", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nao foi possivel criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFrame>
      <section className="auth-card" aria-labelledby="register-title">
        <h2 id="register-title">Criar conta</h2>
        <p>Cadastre seus dados para iniciar um quadro pessoal de tarefas.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="field">
            <span>Telefone</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button primary" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar conta"}
            <UserPlus size={18} />
          </button>
        </form>
        <p className="auth-switch">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </AuthFrame>
  );
}
