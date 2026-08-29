import { describe, expect, it } from "vitest";
import { statusLabel, fromDateTimeLocal, toDateTimeLocal } from "./taskMeta";

describe("task metadata", () => {
  it("keeps the backend status typo mapped to a user label", () => {
    expect(statusLabel.FINISHIED).toBe("Concluidas");
  });

  it("converts date input values to ISO instants", () => {
    const local = toDateTimeLocal("2026-08-29T12:00:00.000Z");
    expect(local).toMatch(/2026-08-29T/);
    expect(fromDateTimeLocal(local)).toMatch(/2026-08-29T\d{2}:00:00.000Z/);
  });
});
