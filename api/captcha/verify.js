import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { ticket, matches } = req.body;

  // Retrieve solution from Vercel KV
  const solution = await kv.get(`captcha:${ticket}`);

  if (!solution) {
    return res.status(400).json({ success: false, message: "Captcha expired or invalid" });
  }

  // Check if all matches are correct
  const correct = Object.entries(solution).every(
    ([shadowId, componentId]) => matches[shadowId] === componentId
  );

  // Delete ticket after verification
  await kv.del(`captcha:${ticket}`);

  res.json({ success: correct });
}
