import express from "express";
import Database from "better-sqlite3";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with { type: "json" };

const app = express();
app.use(express.json());
const expressPort = 3000;
const db = new Database("tasks.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    done BOOLEAN
  )
`);

const seedTasks = [
  ["Wake up at 6am", true],
  ["Brush my Teeth", true],
  ["Code for 2 hours", false],
];

if (db.prepare("SELECT COUNT(*) FROM tasks").pluck().get() === 0) {
  const insertTask = db.prepare(
    "INSERT INTO tasks (title, done) VALUES (?, ?)",
  );
  const seed = db.transaction(() => {
    for (const [title, done] of seedTasks) {
      insertTask.run(title, done ? 1 : 0);
    }
  });
  seed();
}

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const taskFromRow = (task) => ({
  ...task,
  done: Boolean(task.done),
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
  return res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/tasks", (req, res) => {
  const tasks = db
    .prepare("SELECT id, title, done FROM tasks ORDER BY id")
    .all();
  return res.json(tasks.map(taskFromRow));
});

app.get("/tasks/:id", (req, res) => {
  const task = db
    .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
    .get(Number(req.params.id));
  if (task) {
    return res.status(200).json(taskFromRow(task));
  }
  return res.status(404).json({ error: "Task not found" });
});

app.post("/tasks", (req, res) => {
  if (typeof req.body.title === "string") {
    const result = db
      .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
      .run(req.body.title, 0);
    const newTask = db
      .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid);
    return res.status(201).json(taskFromRow(newTask));
  } else {
    return res.sendStatus(400);
  }
});

app.put("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  const existingTask = db
    .prepare("SELECT id FROM tasks WHERE id = ?")
    .get(taskId);
  if (!existingTask) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const updates = [];
  const values = [];
  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string") {
      return res.sendStatus(400);
    }
    updates.push("title = ?");
    values.push(req.body.title);
  }
  if (req.body.done !== undefined) {
    if (typeof req.body.done !== "boolean") {
      return res.sendStatus(400);
    }
    updates.push("done = ?");
    values.push(req.body.done ? 1 : 0);
  }
  if (updates.length === 0) {
    return res.sendStatus(400);
  }

  values.push(taskId);
  db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(
    ...values,
  );
  const updatedTask = db
    .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
    .get(taskId);
  return res.status(200).json(taskFromRow(updatedTask));
});

app.delete("/tasks/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM tasks WHERE id = ?")
    .run(Number(req.params.id));
  if (result.changes > 0) {
    return res.status(204).send("");
  }
  return res.status(404).json({ error: `Task ${req.params.id} not found` });
});

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.listen(expressPort, () => {
  console.log(`Server running on PORT ${expressPort}`);
});
