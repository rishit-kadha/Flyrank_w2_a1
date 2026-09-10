CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tasks (title, done)
SELECT seed.title, seed.done
FROM (VALUES
  ('Wake up at 6am', TRUE),
  ('Brush my Teeth', TRUE),
  ('Code for 2 hours', FALSE)
) AS seed(title, done)
WHERE NOT EXISTS (SELECT 1 FROM tasks);
