import crypto from "crypto";

let captchaStore = {}; // In-memory store. Replace with DB/Redis in production.

const COMPONENTS = [
  { id: "arduino", name: "Arduino Board" },
  { id: "led", name: "LED" },
  { id: "resistor", name: "Resistor" },
  { id: "servo", name: "Servo Motor" },
];

export default function handler(req, res) {
  const ticket = crypto.randomUUID();

  // Shuffle components to randomize positions
  const shuffled = [...COMPONENTS].sort(() => Math.random() - 0.5);

  // Solution mapping for this ticket
  const solution = {};
  shuffled.forEach((comp) => (solution[comp.id] = comp.id));

  // Store solution server-side with expiration
  captchaStore[ticket] = {
    solution,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  // Respond with images (paths in /Assets/Images/)
  res.status(200).json({
    ticket,
    components: shuffled.map((c) => ({
      id: c.id,
      name: c.name,
      image: `/Assets/Images/${c.id}.png`,
    })),
    shadows: shuffled.map((c) => ({
      id: c.id,
      shadow: `/Assets/Images/${c.id}-shadow.png`,
    })),
  });
}
