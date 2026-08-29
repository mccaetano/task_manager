import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("submits email and password", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "token",
          tokenType: "Bearer",
          expiresAt: "2099-01-01T00:00:00Z"
        }),
        { status: 200 }
      )
    );

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await userEvent.type(screen.getByLabelText(/e-mail/i), "ana@example.com");
    await userEvent.type(screen.getByLabelText(/senha/i), "12345678");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "ana@example.com", password: "12345678" })
      })
    );
  });
});
