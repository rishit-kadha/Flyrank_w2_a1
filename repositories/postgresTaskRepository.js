import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { fileURLToPath } from "node:url";

const schemaPath = fileURLToPath(new URL("../sql/schema.sql", import.meta.url));

export class PostgresTaskRepository {
  constructor({ connectionString }) {
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    this.pool = new Pool({ connectionString });
  }

  async initialize() {
    await this.pool.query(readFileSync(schemaPath, "utf8"));
  }

  async list() {
    const result = await this.pool.query(
      "SELECT id, title, done FROM tasks ORDER BY id",
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.pool.query(
      "SELECT id, title, done FROM tasks WHERE id = $1",
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(title) {
    const result = await this.pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, FALSE) RETURNING id, title, done",
      [title],
    );
    return result.rows[0];
  }

  async update(id, changes) {
    const fields = [];
    const values = [];

    if (changes.title !== undefined) {
      fields.push(`title = $${values.length + 1}`);
      values.push(changes.title);
    }
    if (changes.done !== undefined) {
      fields.push(`done = $${values.length + 1}`);
      values.push(changes.done);
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, title, done`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id) {
    const result = await this.pool.query("DELETE FROM tasks WHERE id = $1", [
      id,
    ]);
    return result.rowCount > 0;
  }
}
