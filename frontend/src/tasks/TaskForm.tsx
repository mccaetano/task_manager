import { FormEvent, useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type { Task, TaskRequest, TaskStatus } from "../api/types";
import { fromDateTimeLocal, statusColumns, toDateTimeLocal } from "./taskMeta";

type TaskFormProps = {
  task?: Task | null;
  defaultStatus?: TaskStatus;
  isSaving: boolean;
  onSubmit: (payload: TaskRequest) => void;
  onCancel?: () => void;
};

export function TaskForm({ task, defaultStatus = "CREATED", isSaving, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [duedate, setDuedate] = useState(toDateTimeLocal(task?.duedate));

  useEffect(() => {
    setTitle(task?.title ?? "");
    setStatus(task?.status ?? defaultStatus);
    setDuedate(toDateTimeLocal(task?.duedate));
  }, [defaultStatus, task]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      status,
      duedate: fromDateTimeLocal(duedate)
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Titulo</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} required />
      </label>
      <div className="form-row">
        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            {statusColumns.map((column) => (
              <option key={column.status} value={column.status}>
                {column.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Prazo</span>
          <input
            type="datetime-local"
            value={duedate}
            onChange={(event) => setDuedate(event.target.value)}
            required
          />
        </label>
      </div>
      <div className="button-row">
        {onCancel ? (
          <button className="button ghost" type="button" onClick={onCancel}>
            <X size={16} />
            Cancelar
          </button>
        ) : null}
        <button className="button primary" disabled={isSaving || title.trim().length < 2}>
          <Save size={16} />
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
