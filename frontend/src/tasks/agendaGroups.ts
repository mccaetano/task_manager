import type { Task } from "../api/types";

export type AgendaGroup = {
  key: string;
  label: string;
  tasks: Task[];
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function groupTasksByAgenda(tasks: Task[], reference = new Date()): AgendaGroup[] {
  const today = startOfDay(reference);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(today.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const groups: AgendaGroup[] = [
    { key: "late", label: "Atrasadas", tasks: [] },
    { key: "today", label: "Hoje", tasks: [] },
    { key: "tomorrow", label: "Amanha", tasks: [] },
    { key: "week", label: "Esta semana", tasks: [] },
    { key: "future", label: "Futuras", tasks: [] }
  ];

  for (const task of tasks) {
    const dueDate = new Date(task.duedate);
    if (dueDate < today) groups[0].tasks.push(task);
    else if (dueDate < tomorrow) groups[1].tasks.push(task);
    else if (dueDate < afterTomorrow) groups[2].tasks.push(task);
    else if (dueDate < nextWeek) groups[3].tasks.push(task);
    else groups[4].tasks.push(task);
  }

  return groups.filter((group) => group.tasks.length > 0);
}
