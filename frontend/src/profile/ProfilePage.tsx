import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, UserRound } from "lucide-react";
import { api, ApiError } from "../api/http";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ["current-user"], queryFn: api.currentUser });
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userQuery.data) {
      setForm({
        name: userQuery.data.name ?? "",
        phone: userQuery.data.phone ?? "",
        email: userQuery.data.email ?? "",
        password: ""
      });
    }
  }, [userQuery.data]);

  const updateUser = useMutation({
    mutationFn: () => {
      if (!userQuery.data) {
        throw new Error("Usuario nao carregado.");
      }
      return api.updateUser(userQuery.data.id, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        ...(form.password.trim() ? { password: form.password } : {})
      });
    },
    onSuccess: () => {
      setMessage("Perfil atualizado.");
      setForm((current) => ({ ...current, password: "" }));
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: (error) => {
      setMessage(error instanceof ApiError ? error.message : "Nao foi possivel salvar o perfil.");
    }
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    updateUser.mutate();
  }

  return (
    <div className="profile-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Conta</p>
          <h1>Perfil</h1>
          <p className="page-subtitle">Mantenha seus dados de acesso atualizados.</p>
        </div>
      </header>

      <section className="profile-panel">
        <div className="profile-avatar" aria-hidden="true">
          <UserRound size={30} />
        </div>
        {userQuery.isLoading ? (
          <p>Carregando perfil...</p>
        ) : userQuery.isError ? (
          <div className="state-panel error">
            <span>{userQuery.error instanceof ApiError ? userQuery.error.message : "Nao foi possivel carregar."}</span>
            <button className="button ghost" onClick={() => userQuery.refetch()}>Tentar novamente</button>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nome</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Nova senha</span>
              <input
                type="password"
                minLength={8}
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Deixe em branco para manter"
              />
            </label>
            {message ? <p className={updateUser.isError ? "form-error" : "form-success"}>{message}</p> : null}
            <button className="button primary" disabled={updateUser.isPending}>
              <Save size={18} />
              {updateUser.isPending ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
