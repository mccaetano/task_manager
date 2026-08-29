import type { Task, TaskStatus } from "../api/types";
import { statusColumns } from "./taskMeta";

type StatusQuickActionsProps = {
  task: Task;
  isSaving: boolean;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
};

export function StatusQuickActions({ task, isSaving, onChangeStatus }: StatusQuickActionsProps) {
  return (
    <div className="quick-status" aria-label={`Mudar status de ${task.title}`}>
      {statusColumns.map((column) => (
        <button
          key={column.status}
          className={`quick-status-button ${task.status === column.status ? "active" : ""}`}
          style={{ "--status-tone": column.tone } as React.CSSProperties}
          disabled={isSaving || task.status === column.status}
          onClick={(event) => {
            event.stopPropagation();
            onChangeStatus(task, column.status);
          }}
          title={column.label}
          aria-label={`Mover para ${column.label}`}
        >
          <span />
        </button>
      ))}
    </div>
  );
}
