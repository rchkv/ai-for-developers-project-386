import express from "express";
import cors from "cors";
import ownersRouter from "./routes/owners.js";
import eventsRouter from "./routes/events.js";
import slotsRouter from "./routes/slots.js";
import { errorHandler } from "./lib/errors.js";

const PORT = process.env.PORT || 4010;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/owners", ownersRouter);
app.use("/events", eventsRouter);
app.use("/slots", slotsRouter);

app.use((req, res) => {
  res.status(404).json({ code: 404, message: `Маршрут ${req.method} ${req.path} не найден.` });
});

// Express error-handler должен принимать 4 аргумента, иначе не сработает.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Calendar booking backend слушает http://localhost:${PORT}`);
});
