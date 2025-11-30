import crypto from "crypto";
import jwt from "jsonwebtoken";

const COMPONENTS = [
  { id: "arduino", name: "Arduino Board" },
{ id: "led", name: "LED" },
{ id: "resistor", name: "Resistor" },
{ id: "servo", name: "Servo Motor" },
];

export default async function handler(req, res) {
  const ticket = crypto.randomUUID();

  // Shuffle components
  const shuffled = [...COMPONENTS].sort(() => Math.random() - 0.5);

  // Solution mapping for this ticket
  const solution = {};
  shuffled.forEach((comp) => (solution[comp.id] = comp.id));

  // Create JWT payload
  const payload = {
    ticket,
    solution,
  };
  // Sign JWT with 5-minute expiration (best for CAPTCHA)
  const token = jwt.sign(payload, process.env.CAPTCHA_SECRET, { expiresIn: "5m" });

  // Respond with images, ticket, and jwt
  res.status(200).json({
    ticket,
    token, // <-- frontend must store this for verification step!
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
