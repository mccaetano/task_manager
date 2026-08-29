import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, CheckSquare, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function AppShell() {
  const { logout } = useAuth();

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="brand-row">
          <span className="brand-mark small">TM</span>
          <span>Task Manager</span>
        </div>
        <nav className="nav-list">
          <NavLink to="/tasks">
            <CheckSquare size={18} />
            Tarefas
          </NavLink>
          <NavLink to="/agenda">
            <CalendarDays size={18} />
            Agenda
          </NavLink>
          <NavLink to="/profile">
            <UserRound size={18} />
            Perfil
          </NavLink>
        </nav>
        <button className="button ghost sidebar-exit" onClick={logout}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>
      <section className="content-area">
        <Outlet />
      </section>
    </main>
  );
}
