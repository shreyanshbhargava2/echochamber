export default async function handler(req, res) {
  const { topic } = req.body;

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.blaze-0b7x7h7rljcmy3ow,
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
