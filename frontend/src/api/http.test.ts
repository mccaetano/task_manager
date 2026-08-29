import { afterEach, describe, expect, it, vi } from "vitest";
import { api, clearStoredToken, getStoredToken, storeToken } from "./http";

describe("http client session", () => {
  afterEach(() => {
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it("stores and clears a valid token", () => {
    storeToken({ accessToken: "abc", tokenType: "Bearer", expiresAt: "2099-01-01T00:00:00Z" });
    expect(getStoredToken()).toBe("abc");

    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });

  it("sends bearer tokens to protected endpoints", async () => {
    storeToken({ accessToken: "abc", tokenType: "Bearer", expiresAt: "2099-01-01T00:00:00Z" });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "u1", email: "a@b.com", name: "Ana", phone: "123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    await api.currentUser();

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });
});
