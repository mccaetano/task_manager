import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { api, ApiError } from "../api/http";
import type { Task, TaskStatus } from "../api/types";
import { formatDateTime, statusLabel } from "./taskMeta";
import { StatusQuickActions } from "./StatusQuickActions";

type TaskDetailModalProps = {
  task: Task;
  isSaving: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
};

export function TaskDetailModal({
  task,
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus
}: TaskDetailModalProps) {
  const detailQuery = useQuery({
    queryKey: ["task-detail", task.id],
    queryFn: () => api.getTask(task.id),
    initialData: task
  });

  const detail = detailQuery.data ?? task;

  return (
    <section className="modal task-detail" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
      <div className="modal-header">
        <div>
          <p className="eyebrow">Detalhe da tarefa</p>
          <h2 id="task-detail-title">{detail.title}</h2>
        </div>
        <button className="icon-button" aria-label="Fechar detalhe" onClick={onClose}>
          <X size={17} />
        </button>
      </div>

      {detailQuery.isError ? (
        <p className="form-error" role="alert">
          {detailQuery.error instanceof ApiError ? detailQuery.error.message : "Nao foi possivel atualizar o detalhe."}
        </p>
      ) : null}

      <dl className="detail-list">
        <div>
          <dt>Status</dt>
          <dd>{statusLabel[detail.status]}</dd>
        </div>
        <div>
          <dt>Prazo</dt>
          <dd>
            <CalendarClock size={15} />
            {formatDateTime(detail.duedate)}
          </dd>
        </div>
        <div>
          <dt>Atualizada</dt>
          <dd>
            <RefreshCw size={15} />
            {formatDateTime(detail.updated)}
          </dd>
        </div>
      </dl>

      <StatusQuickActions task={detail} isSaving={isSaving} onChangeStatus={onChangeStatus} />

      <div className="button-row">
        <button className="button ghost" onClick={() => onEdit(detail)}>
          <Pencil size={16} />
          Editar
        </button>
        <button className="button danger" onClick={() => onDelete(detail)}>
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </section>
  );
}
