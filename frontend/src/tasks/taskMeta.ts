import type { TaskStatus } from "../api/types";

export const statusColumns: Array<{ status: TaskStatus; label: string; tone: string }> = [
  { status: "CREATED", label: "Criadas", tone: "#869BF6" },
  { status: "OPEN", label: "Em andamento", tone: "#6B9AD5" },
  { status: "FINISHIED", label: "Concluidas", tone: "#929684" },
  { status: "CANCELED", label: "Canceladas", tone: "#D27F36" }
];

export const statusLabel = Object.fromEntries(
  statusColumns.map((column) => [column.status, column.label])
) as Record<TaskStatus, string>;

export function toDateTimeLocal(value?: string) {
  const date = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
