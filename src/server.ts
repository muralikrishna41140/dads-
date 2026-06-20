import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type GeminiChatRequest = {
  message?: string;
  context?: unknown;
};

async function handleGeminiChat(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const runtimeEnv = env as Record<string, string | undefined>;
  const apiKey =
    runtimeEnv?.GEMINI_API_KEY ??
    runtimeEnv?.VITE_GEMINI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ reply: "" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const body = (await request.json()) as GeminiChatRequest;
  const message = body.message?.trim();
  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const prompt = [
    "You are DadDesk AI, a concise assistant for a family finance dashboard.",
    "Use the provided app context when relevant. If the context is insufficient, answer clearly and briefly.",
    "Return plain text only.",
    "",
    `App context: ${JSON.stringify(body.context ?? {}, null, 2)}`,
    `User message: ${message}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ reply: "" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const result = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const reply = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  return new Response(JSON.stringify({ reply }), {
    headers: { "content-type": "application/json" },
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/gemini-chat") {
        return await handleGeminiChat(request, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
