import crypto from "crypto";
import { kv } from "@vercel/kv";

const COMPONENTS = [
  { id: "arduino", name: "Arduino Board" },
{ id: "led", name: "LED" },
{ id: "resistor", name: "Resistor" },
{ id: "servo", name: "Servo Motor" },
];

export default async function handler(req, res) {
  const ticket = crypto.randomUUID();

  // Shuffle components to randomize positions
  const shuffled = [...COMPONENTS].sort(() => Math.random() - 0.5);

  // Solution mapping for this ticket
  const solution = {};
  shuffled.forEach((comp) => (solution[comp.id] = comp.id));

  // Store solution in Vercel KV with 5-minute expiration
  await kv.set(`captcha:${ticket}`, solution, { ex: 300 });

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
