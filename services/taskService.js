export class TaskService {
  constructor(repository) {
    this.repository = repository;
  }

  listTasks() {
    return this.repository.list();
  }

  getTask(id) {
    return this.repository.findById(id);
  }

  createTask(title) {
    return this.repository.create(title);
  }

  updateTask(id, changes) {
    return this.repository.update(id, changes);
  }

  deleteTask(id) {
    return this.repository.delete(id);
  }
}
