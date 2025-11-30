import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { token, matches } = req.body;

  if (!token || !matches) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.CAPTCHA_SECRET);
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid or expired CAPTCHA" });
  }

  // Check if all matches are correct
  const correct = Object.entries(payload.solution).every(
    ([shadowId, componentId]) => matches[shadowId] === componentId
  );

  res.json({ success: correct });
}
