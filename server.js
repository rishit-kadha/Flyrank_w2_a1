import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with { type: "json" };

const app = express();
app.use(express.json());
const expressPort = 3000;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
let tasks = [
  {
    id: 1,
    title: "Wake up at 6am",
    done: true,
  },
  {
    id: 2,
    title: "Brush my Teeth",
    done: true,
  },
  {
    id: 3,
    title: "Code for 2 hours",
    done: false,
  },
];
let tasksId = 3;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
  return res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/tasks", (req, res) => {
  return res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === Number(req.params.id)) {
      return res.status(200).json(tasks[i]);
    }
  }
  return res.status(404).json({ error: `Task ${req.params.id} not found` });
});

app.post("/tasks", (req, res) => {
  if (typeof req.body.title === "string") {
    let newTask = {
      id: ++tasksId,
      title: req.body.title,
      done: false,
    };
    tasks.push(newTask);
    return res.status(201).json(newTask);
  } else {
    return res.sendStatus(400);
  }
});

app.put("/tasks/:id", (req, res) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === Number(req.params.id)) {
      let hasTitle = false;
      let hasDone = false;
      if (req.body.title !== undefined) {
        if (typeof req.body.title === "string") {
          hasTitle = true;
        } else {
          return res.sendStatus(400);
        }
      }
      if (req.body.done !== undefined) {
        if (typeof req.body.done === "boolean") {
          hasDone = true;
        } else {
          return res.sendStatus(400);
        }
      }
      if (hasDone && hasTitle) {
        tasks[i].title = req.body.title;
        tasks[i].done = req.body.done;
      } else if (hasDone) {
        tasks[i].done = req.body.done;
      } else if (hasTitle) {
        tasks[i].title = req.body.title;
      } else {
        return res.sendStatus(400);
      }
      return res.status(200).json(tasks[i]);
    }
  }
  return res.status(404).json({ error: `Task ${req.params.id} not found` });
});

app.delete("/tasks/:id", (req, res) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === Number(req.params.id)) {
      tasks.splice(i, 1);
      return res.status(204).send("");
    }
  }
  return res.status(404).json({ error: `Task ${req.params.id} not found` });
});

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.listen(expressPort, () => {
  console.log(`Server running on PORT ${expressPort}`);
});
