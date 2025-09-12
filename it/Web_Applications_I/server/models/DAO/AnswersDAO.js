import { initDB } from '../db.js'; 
class AnswersDAO {
  constructor() {
    this.dbPromise = initDB();
  }

  async createTable() {
    const db = await this.dbPromise;
    await db.run(`
      CREATE TABLE IF NOT EXISTS Answers (
        assignmentId INTEGER PRIMARY KEY,
        answerText TEXT NOT NULL,
        submittedBy INTEGER NOT NULL,
        FOREIGN KEY (assignmentId) REFERENCES Assignments(id),
        FOREIGN KEY (submittedBy) REFERENCES Users(id)
      );
    `);
  }

  async upsertAnswer(assignmentId, answerText, studentId) {
    const db = await this.dbPromise;

    const assignment = await db.get(`SELECT status FROM Assignments WHERE id = ?`, [assignmentId]);
    if (!assignment || assignment.status !== 'open') {
      throw new Error("Assignment is closed or does not exist.");
    }

    // Verify the student belongs to the group
    const isInGroup = await db.get(`
      SELECT * FROM Groups
      WHERE assignmentId = ? AND studentId = ?`,
      [assignmentId, studentId]
    );
    if (!isInGroup) {
      throw new Error("Student not part of the group.");
    }
    const existing = await db.get(`SELECT * FROM Answers WHERE assignmentId = ?`, [assignmentId]);

    if (existing) {
      await db.run(`
        UPDATE Answers
        SET answerText = ?, submittedBy = ?
        WHERE assignmentId = ?`,
        [answerText, studentId, assignmentId]
      );
    } else {
      await db.run(`
        INSERT INTO Answers (assignmentId, answerText, submittedBy)
        VALUES (?, ?, ?)`,
        [assignmentId, answerText, studentId]
      );
    }
  }

  async getAnswer(assignmentId) {
    const db = await this.dbPromise;
    return db.get(`SELECT * FROM Answers WHERE assignmentId = ?`, [assignmentId]);
  }
}

export default new AnswersDAO(); 