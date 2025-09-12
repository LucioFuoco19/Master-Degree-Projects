import { initDB } from '../db.js';
class AssignmentsDAO {
  constructor() {
    this.dbPromise = initDB();
  }
  async createTable() {
    const db = await this.dbPromise;
    await db.run(`
      CREATE TABLE IF NOT EXISTS Assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        teacherId INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
        FOREIGN KEY (teacherId) REFERENCES Users(id)
      );
    `);
  }

  async insertAssignment(question, teacherId) {
    const db = await this.dbPromise;
    await db.run(
      `INSERT INTO Assignments (question, teacherId, status) VALUES (?, ?, 'open')`,
      [question, teacherId]
    );
  }

  async getAssignmentById(id) {
    const db = await this.dbPromise;
    return db.get(`SELECT * FROM Assignments WHERE id = ?`, [id]);
  }

  async getAllAssignments() {
    const db = await this.dbPromise;
    return db.all(`SELECT * FROM Assignments`);
  }

  async getOpenAssignments() {
    const db = await this.dbPromise;
    return db.all(`SELECT * FROM Assignments WHERE status = 'open'`);
  }
  async closeAssignment(id) {
    const db = await this.dbPromise;
    await db.run(`UPDATE Assignments SET status = 'closed' WHERE id = ?`, [id]);
  }
  async insertAssignmentReturningId(question, teacherId) {
  const db = await this.dbPromise;
  const result = await db.run(
    `INSERT INTO Assignments (question, teacherId, status) VALUES (?, ?, 'open')`,
    [question, teacherId]
  );
  return result.lastID;
}
async getOpenAssignmentsByTeacher(teacherId) {
  const db = await this.dbPromise;
  return db.all(`
    SELECT A.id, A.question, A.status
    FROM Assignments A
    WHERE A.teacherId = ? AND A.status = 'open'
  `, [teacherId]);
}

}

export default new AssignmentsDAO();