import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BoardPage } from "./BoardPage";

describe("BoardPage", () => {
  it("loads and creates tasks", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.startsWith("/api/tasks") && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            id: "2",
            title: "Nova entrega",
            status: "CREATED",
            duedate: "2026-08-30T12:00:00Z",
            updated: "2026-08-29T12:00:00Z",
            userId: "u1"
          }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({
          content: [
            {
              id: "1",
              title: "Preparar backlog",
              status: "CREATED",
              duedate: "2026-08-30T12:00:00Z",
              updated: "2026-08-29T12:00:00Z",
              userId: "u1"
            }
          ],
          totalPages: 1,
          totalElements: 1,
          size: 50,
          number: 0,
          last: true,
          first: true,
          numberOfElements: 1
        }),
        { status: 200 }
      );
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <BoardPage />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Preparar backlog")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: /nova tarefa/i })[0]);
    await userEvent.type(screen.getByLabelText(/titulo/i), "Nova entrega");
    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/tasks", expect.objectContaining({ method: "POST" })));
  });
});
