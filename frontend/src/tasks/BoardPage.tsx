import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AlertCircle, Loader2, Plus, Search } from "lucide-react";
import { ApiError } from "../api/http";
import type { Task, TaskRequest, TaskStatus } from "../api/types";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskColumn } from "./TaskColumn";
import { TaskForm } from "./TaskForm";
import { statusColumns } from "./taskMeta";
import { useTaskMutations, useTasks } from "./useTasks";

type ModalState =
  | { type: "create"; status: TaskStatus }
  | { type: "edit"; task: Task }
  | { type: "delete"; task: Task }
  | { type: "detail"; task: Task }
  | null;

export function BoardPage() {
  const [modal, setModal] = useState<ModalState>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [sort, setSort] = useState<"duedate" | "updated">("duedate");
  const [actionError, setActionError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const tasksQuery = useTasks();
  const { createTask, updateTask, deleteTask, changeStatus, isSaving } = useTaskMutations(handleActionError, () => {
    setModal(null);
    setActionError("");
  });
  const allTasks = tasksQuery.tasks;

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return allTasks
      .filter((task) => (statusFilter === "ALL" ? true : task.status === statusFilter))
      .filter((task) => task.title.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => Date.parse(a[sort]) - Date.parse(b[sort]));
  }, [allTasks, search, sort, statusFilter]);

  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce<Record<TaskStatus, Task[]>>(
      (accumulator, column) => {
        accumulator[column.status] = visibleTasks.filter((task) => task.status === column.status);
        return accumulator;
      },
      { CREATED: [], OPEN: [], FINISHIED: [], CANCELED: [] }
    );
  }, [visibleTasks]);

  function handleActionError(error: Error) {
    setActionError(error instanceof ApiError ? error.message : "Nao foi possivel concluir a acao.");
  }

  function handleSubmit(payload: TaskRequest) {
    if (modal?.type === "edit") {
      updateTask.mutate({ id: modal.task.id, payload });
      return;
    }
    createTask.mutate(payload);
  }

  function handleDragEnd(event: DragEndEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    const overId = String(event.over?.id ?? "");
    const overTask = allTasks.find((item) => item.id === overId);
    const overStatus = (event.over?.data.current?.status ?? overTask?.status) as TaskStatus | undefined;

    if (!task || !overStatus || task.status === overStatus) {
      return;
    }

    updateTask.mutate({
      id: task.id,
      payload: { title: task.title, status: overStatus, duedate: task.duedate }
    });
  }

  const loadedCount = allTasks.length;
  const totalCount = tasksQuery.totalCount;

  return (
    <div className="board-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Fluxo continuo</p>
          <h1>Tarefas</h1>
          <p className="page-subtitle">{loadedCount} de {totalCount} tarefas carregadas</p>
        </div>
        <button className="button primary" onClick={() => setModal({ type: "create", status: "CREATED" })}>
          <Plus size={18} />
          Nova tarefa
        </button>
      </header>

      <section className="toolbar" aria-label="Filtros de tarefas">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar tarefa"
          />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "ALL")}>
          <option value="ALL">Todos os status</option>
          {statusColumns.map((column) => (
            <option key={column.status} value={column.status}>{column.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as "duedate" | "updated")}>
          <option value="duedate">Ordenar por prazo</option>
          <option value="updated">Ordenar por atualizacao</option>
        </select>
      </section>

      {tasksQuery.isLoading ? (
        <section className="state-panel">
          <Loader2 className="spin" size={24} />
          Carregando tarefas...
        </section>
      ) : tasksQuery.isError ? (
        <section className="state-panel error">
          <AlertCircle size={24} />
          <span>{tasksQuery.error instanceof ApiError ? tasksQuery.error.message : "Nao foi possivel carregar."}</span>
          <button className="button ghost" onClick={() => tasksQuery.refetch()}>Tentar novamente</button>
        </section>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <section className="kanban-board" aria-label="Quadro de tarefas">
              {statusColumns.map((column) => (
                <TaskColumn
                  key={column.status}
                  status={column.status}
                  label={column.label}
                  tone={column.tone}
                  tasks={tasksByStatus[column.status]}
                  isSaving={isSaving}
                  onAdd={(status) => setModal({ type: "create", status })}
                  onOpen={(task) => setModal({ type: "detail", task })}
                  onEdit={(task) => setModal({ type: "edit", task })}
                  onDelete={(task) => setModal({ type: "delete", task })}
                  onChangeStatus={changeStatus}
                />
              ))}
            </section>
          </DndContext>
          {tasksQuery.hasNextPage ? (
            <div className="load-more">
              <button className="button ghost" onClick={() => tasksQuery.fetchNextPage()} disabled={tasksQuery.isFetchingNextPage}>
                {tasksQuery.isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          ) : null}
        </>
      )}

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
                  <button className="button ghost" onClick={() => setModal(null)}>Cancelar</button>
                  <button className="button danger" onClick={() => deleteTask.mutate(modal.task.id)} disabled={isSaving}>
                    Excluir
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{modal.type === "edit" ? "Editar tarefa" : "Nova tarefa"}</h2>
                {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
                <TaskForm
                  task={modal.type === "edit" ? modal.task : null}
                  defaultStatus={modal.type === "create" ? modal.status : undefined}
                  isSaving={isSaving}
                  onSubmit={handleSubmit}
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
