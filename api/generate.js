// Vercel Edge Function: /api/generate
//
// This proxies to Anthropic's Messages API with streaming enabled.
// Edge runtime + streaming = no 60s timeout limit, and the user sees
// progress in real-time instead of waiting for the whole response.
//
// The API key (ANTHROPIC_API_KEY) lives only in Vercel environment variables.

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server misconfigured: ANTHROPIC_API_KEY not set in Vercel environment.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    // Force streaming on — this is what prevents the timeout
    const streamingBody = { ...body, stream: true };

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(streamingBody),
    });

    // If Anthropic returned a non-streaming error, surface it to the client
    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pipe the Server-Sent Events stream straight through to the browser
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Proxy failed to reach Anthropic API",
        detail: err.message || String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
