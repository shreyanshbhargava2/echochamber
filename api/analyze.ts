export default async function handler(req, res) {
  const { topic } = req.body;

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: `Analyze media coverage of: ${topic}` }],
    }),
  });

  const data = await response.json();
  res.json(data);
}
