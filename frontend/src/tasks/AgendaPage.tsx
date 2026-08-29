import { useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Loader2, Search } from "lucide-react";
import { ApiError } from "../api/http";
import type { Task, TaskStatus } from "../api/types";
import { StatusQuickActions } from "./StatusQuickActions";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskForm } from "./TaskForm";
import { formatDateTime, statusColumns, statusLabel } from "./taskMeta";
import { groupTasksByAgenda } from "./agendaGroups";
import { useTaskMutations, useTasks } from "./useTasks";

type ModalState =
  | { type: "detail"; task: Task }
  | { type: "edit"; task: Task }
  | { type: "delete"; task: Task }
  | null;

export function AgendaPage() {
  const tasksQuery = useTasks();
  const [modal, setModal] = useState<ModalState>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [actionError, setActionError] = useState("");

  const { updateTask, deleteTask, changeStatus, isSaving } = useTaskMutations(handleActionError, () => {
    setModal(null);
    setActionError("");
  });

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tasksQuery.tasks
      .filter((task) => (statusFilter === "ALL" ? true : task.status === statusFilter))
      .filter((task) => task.title.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => Date.parse(a.duedate) - Date.parse(b.duedate));
  }, [search, statusFilter, tasksQuery.tasks]);

  const groups = useMemo(() => groupTasksByAgenda(visibleTasks), [visibleTasks]);

  function handleActionError(error: Error) {
    setActionError(error instanceof ApiError ? error.message : "Nao foi possivel concluir a acao.");
  }

  return (
    <div className="agenda-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1>Agenda</h1>
          <p className="page-subtitle">
            {tasksQuery.tasks.length} de {tasksQuery.totalCount} tarefas carregadas
          </p>
        </div>
      </header>

      <section className="toolbar" aria-label="Filtros da agenda">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar na agenda"
          />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "ALL")}>
          <option value="ALL">Todos os status</option>
          {statusColumns.map((column) => (
            <option key={column.status} value={column.status}>
              {column.label}
            </option>
          ))}
        </select>
      </section>

      {tasksQuery.isLoading ? (
        <section className="state-panel">
          <Loader2 className="spin" size={24} />
          Carregando agenda...
        </section>
      ) : tasksQuery.isError ? (
        <section className="state-panel error">
          <AlertCircle size={24} />
          <span>{tasksQuery.error instanceof ApiError ? tasksQuery.error.message : "Nao foi possivel carregar."}</span>
          <button className="button ghost" onClick={() => tasksQuery.refetch()}>
            Tentar novamente
          </button>
        </section>
      ) : groups.length ? (
        <section className="agenda-list" aria-label="Agenda de tarefas">
          {groups.map((group) => (
            <article className="agenda-group" key={group.key}>
              <header>
                <CalendarDays size={18} />
                <h2>{group.label}</h2>
                <span>{group.tasks.length}</span>
              </header>
              <div className="agenda-items">
                {group.tasks.map((task) => (
                  <article className="agenda-item" key={task.id}>
                    <button className="agenda-open" onClick={() => setModal({ type: "detail", task })}>
                      <span className="agenda-time">{formatDateTime(task.duedate)}</span>
                      <span className="agenda-title">{task.title}</span>
                    </button>
                    <span className="status-pill">{statusLabel[task.status]}</span>
                    <StatusQuickActions task={task} isSaving={isSaving} onChangeStatus={changeStatus} />
                  </article>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="state-panel">Nenhuma tarefa encontrada para estes filtros.</section>
      )}

      {tasksQuery.hasNextPage ? (
        <div className="load-more">
          <button className="button ghost" onClick={() => tasksQuery.fetchNextPage()} disabled={tasksQuery.isFetchingNextPage}>
            {tasksQuery.isFetchingNextPage ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      ) : null}

      {modal ? (
        <div className="modal-backdrop" role="presentation">
          {modal.type === "detail" ? (
            <TaskDetailModal
              task={modal.task}
              isSaving={isSaving}
              onClose={() => setModal(null)}
              onEdit={(task) => setModal({ type: "edit", task })}
              onDelete={(task) => setModal({ type: "delete", task })}
              onChangeStatus={changeStatus}
            />
          ) : (
            <section className="modal" role="dialog" aria-modal="true">
              {modal.type === "delete" ? (
                <>
                  <h2>Excluir tarefa?</h2>
                  <p>A tarefa "{modal.task.title}" sera removida permanentemente.</p>
                  {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
                  <div className="button-row">
                    <button className="button ghost" onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button className="button danger" onClick={() => deleteTask.mutate(modal.task.id)} disabled={isSaving}>
                      Excluir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2>Editar tarefa</h2>
                  {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
                  <TaskForm
                    task={modal.task}
                    isSaving={isSaving}
                    onSubmit={(payload) => updateTask.mutate({ id: modal.task.id, payload })}
                    onCancel={() => setModal(null)}
                  />
                </>
              )}
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
