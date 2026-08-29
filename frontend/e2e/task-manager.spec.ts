import { expect, test } from "@playwright/test";

const task = {
  id: "task-1",
  title: "Planejar sprint",
  status: "CREATED",
  duedate: "2026-08-30T12:00:00Z",
  updated: "2026-08-29T12:00:00Z",
  userId: "user-1"
};

test("critical authenticated task flow", async ({ page }) => {
  let tasks = [task];

  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      json: { accessToken: "token", tokenType: "Bearer", expiresAt: "2099-01-01T00:00:00Z" }
    });
  });

  await page.route("**/api/users", async (route) => {
    await route.fulfill({ json: { id: "user-1", email: "ana@example.com", name: "Ana", phone: "11999999999" } });
  });

  await page.route("**/api/tasks**", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      const payload = request.postDataJSON();
      tasks = [{ ...task, id: "task-2", ...payload }, ...tasks];
      await route.fulfill({ json: tasks[0] });
      return;
    }

    if (request.method() === "PUT") {
      const payload = request.postDataJSON();
      const id = request.url().split("/").pop();
      tasks = tasks.map((item) => (item.id === id ? { ...item, ...payload } : item));
      await route.fulfill({ json: tasks.find((item) => item.id === id) });
      return;
    }

    const id = request.url().match(/\/api\/tasks\/([^?]+)$/)?.[1];
    if (id) {
      await route.fulfill({ json: tasks.find((item) => item.id === id) });
      return;
    }

    await route.fulfill({
      json: {
        content: tasks,
        totalPages: 1,
        totalElements: tasks.length,
        size: 50,
        number: 0,
        last: true,
        first: true,
        numberOfElements: tasks.length
      }
    });
  });

  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@example.com");
  await page.getByLabel("Senha").fill("12345678");
  await page.getByRole("button", { name: /entrar/i }).click();

  await expect(page.getByRole("heading", { name: "Tarefas" })).toBeVisible();
  await expect(page.getByText("Planejar sprint")).toBeVisible();

  await page.getByRole("button", { name: /nova tarefa/i }).first().click();
  await page.getByLabel("Titulo").fill("Revisar PRD");
  await page.getByRole("button", { name: /salvar/i }).click();
  await expect(page.getByText("Revisar PRD")).toBeVisible();

  await page.getByRole("link", { name: /agenda/i }).click();
  await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
  await page.getByText("Revisar PRD").click();
  const detail = page.getByRole("dialog", { name: "Revisar PRD" });
  await expect(detail).toBeVisible();
  await detail.getByLabel("Mover para Em andamento").click();
  await expect(detail.getByText("Em andamento")).toBeVisible();

  await detail.getByLabel("Fechar detalhe").click();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
