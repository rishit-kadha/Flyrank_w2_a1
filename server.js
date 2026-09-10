import express from "express";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with { type: "json" };
import { PostgresTaskRepository } from "./repositories/postgresTaskRepository.js";
import { TaskService } from "./services/taskService.js";

const app = express();
app.use(express.json());
const expressPort = 3000;
const taskRepository = new PostgresTaskRepository({
  connectionString: process.env.DATABASE_URL,
});
const taskService = new TaskService(taskRepository);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
  return res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/tasks", async (req, res) => {
  return res.json(await taskService.listTasks());
});

app.get("/tasks/:id", async (req, res) => {
  const task = await taskService.getTask(Number(req.params.id));
  if (task) {
    return res.status(200).json(task);
  }
  return res.status(404).json({ error: "Task not found" });
});

app.post("/tasks", async (req, res) => {
  if (typeof req.body.title === "string") {
    const newTask = await taskService.createTask(req.body.title);
    return res.status(201).json(newTask);
  } else {
    return res.sendStatus(400);
  }
});

app.put("/tasks/:id", async (req, res) => {
  const taskId = Number(req.params.id);
  const existingTask = await taskService.getTask(taskId);
  if (!existingTask) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const updates = {};
  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string") {
      return res.sendStatus(400);
    }
    updates.title = req.body.title;
  }
  if (req.body.done !== undefined) {
    if (typeof req.body.done !== "boolean") {
      return res.sendStatus(400);
    }
    updates.done = req.body.done;
  }
  if (Object.keys(updates).length === 0) {
    return res.sendStatus(400);
  }

  const updatedTask = await taskService.updateTask(taskId, updates);
  return res.status(200).json(updatedTask);
});

app.delete("/tasks/:id", async (req, res) => {
  const deleted = await taskService.deleteTask(Number(req.params.id));
  if (deleted) {
    return res.status(204).send("");
  }
  return res.status(404).json({ error: `Task ${req.params.id} not found` });
});

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

await taskRepository.initialize();

app.listen(expressPort, () => {
  console.log(`Server running on PORT ${expressPort}`);
});
