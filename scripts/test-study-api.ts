import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../src/app/api/study-plan/route";
import { GET as getLogs, POST as postLogs } from "../src/app/api/logs/route";
import { POST as generate } from "../src/app/api/generate/route";
import { NextRequest } from "next/server";

describe("student endpoint authorization", () => {
  for (const [name, handler, method] of [
    ["read plan", GET, "GET"], ["update plan", POST, "POST"],
    ["read history", getLogs, "GET"], ["save history", postLogs, "POST"],
    ["generate quiz", generate, "POST"],
  ] as const) {
    it(`rejects unauthenticated ${name} before database or AI access`, async () => {
      const response = await handler(new NextRequest("http://localhost/api/test", { method }));
      assert.equal(response.status, 401);
    });
  }
});
