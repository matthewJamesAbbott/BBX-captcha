let captchaStore = {}; // same in-memory store, shared or imported

export default function handler(req, res) {
  const { ticket, matches } = req.body;

  const record = captchaStore[ticket];
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ success: false, message: "Captcha expired" });
  }

  // Check if all matches are correct
  const correct = Object.entries(record.solution).every(
    ([shadowId, componentId]) => matches[shadowId] === componentId
  );

  // Optionally delete ticket after verification
  delete captchaStore[ticket];

  res.json({ success: correct });
}
