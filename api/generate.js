// Vercel Serverless Function: /api/generate
//
// This receives requests from the frontend, adds the Anthropic API key
// (stored as a Vercel environment variable — NEVER committed to git),
// and forwards to Anthropic's Messages API.
//
// Why: if we called Anthropic directly from the browser, the API key would
// be visible to anyone who inspects network traffic. This proxy keeps it secret.

export default async function handler(req, res) {
  // Lock down to POST only
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfigured: ANTHROPIC_API_KEY not set in Vercel environment.",
    });
  }

  try {
    // Pass the body straight through. The frontend already formats it correctly
    // (model, max_tokens, messages, optional tools).
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    // Forward status + body back to the browser so the frontend sees the real response
    res.status(response.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({
      error: "Proxy failed to reach Anthropic API",
      detail: err.message || String(err),
    });
  }
}

// Give this function more time — Anthropic calls with web_search can take 30-60s
export const config = {
  maxDuration: 60,
};
