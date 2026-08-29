import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarClock, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "../api/types";
import { StatusQuickActions } from "./StatusQuickActions";
import { formatDateTime, statusLabel } from "./taskMeta";

type TaskCardProps = {
  task: Task;
  isSaving: boolean;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
};

export function TaskCard({ task, isSaving, onOpen, onEdit, onDelete, onChangeStatus }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "is-dragging" : ""}`}
      onClick={() => onOpen(task)}
    >
      <div className="task-card-top">
        <button className="icon-button drag-handle" aria-label="Mover tarefa" {...attributes} {...listeners}>
          <GripVertical size={18} />
        </button>
        <span className="status-pill">{statusLabel[task.status]}</span>
      </div>
      <h3>{task.title}</h3>
      <p className="task-date">
        <CalendarClock size={15} />
        {formatDateTime(task.duedate)}
      </p>
      <StatusQuickActions task={task} isSaving={isSaving} onChangeStatus={onChangeStatus} />
      <div className="task-actions">
        <button
          className="icon-button"
          aria-label={`Editar ${task.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(task);
          }}
        >
          <Pencil size={16} />
        </button>
        <button
          className="icon-button danger"
          aria-label={`Excluir ${task.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task);
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
