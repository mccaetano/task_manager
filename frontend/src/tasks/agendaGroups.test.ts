import { describe, expect, it } from "vitest";
import type { Task } from "../api/types";
import { groupTasksByAgenda } from "./agendaGroups";

function task(id: string, title: string, duedate: string): Task {
  return {
    id,
    title,
    duedate,
    updated: "2026-08-29T12:00:00Z",
    status: "CREATED",
    userId: "user-1"
  };
}

describe("agenda groups", () => {
  it("groups tasks by due date windows", () => {
    const groups = groupTasksByAgenda(
      [
        task("1", "Atrasada", "2026-08-28T12:00:00Z"),
        task("2", "Hoje", "2026-08-29T18:00:00Z"),
        task("3", "Amanha", "2026-08-30T12:00:00Z"),
        task("4", "Semana", "2026-09-02T12:00:00Z"),
        task("5", "Futura", "2026-09-15T12:00:00Z")
      ],
      new Date("2026-08-29T09:00:00Z")
    );

    expect(groups.map((group) => group.label)).toEqual([
      "Atrasadas",
      "Hoje",
      "Amanha",
      "Esta semana",
      "Futuras"
    ]);
  });
});
