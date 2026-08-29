import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "../api/types";
import { TaskCard } from "./TaskCard";

type TaskColumnProps = {
  status: TaskStatus;
  label: string;
  tone: string;
  tasks: Task[];
  isSaving: boolean;
  onAdd: (status: TaskStatus) => void;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
};

export function TaskColumn({
  status,
  label,
  tone,
  tasks,
  isSaving,
  onAdd,
  onOpen,
  onEdit,
  onDelete,
  onChangeStatus
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: "column", status } });

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "is-over" : ""}`}
      style={{ "--column-tone": tone } as React.CSSProperties}
      aria-labelledby={`${status}-title`}
    >
      <header className="column-header">
        <div>
          <span className="column-dot" />
          <h2 id={`${status}-title`}>{label}</h2>
        </div>
        <span className="column-count">{tasks.length}</span>
      </header>
      <button className="add-task" onClick={() => onAdd(status)}>
        <Plus size={16} />
        Nova tarefa
      </button>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="task-list">
          {tasks.length ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSaving={isSaving}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
                onChangeStatus={onChangeStatus}
              />
            ))
          ) : (
            <p className="empty-column">Sem tarefas por aqui.</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
