import { initDB } from '../db.js';
class EvaluationsDAO {
  constructor() {
    this.dbPromise = initDB();
  }
  async createTable() {
    const db = await this.dbPromise;
    await db.run(`
      CREATE TABLE IF NOT EXISTS Evaluations (
        assignmentId INTEGER PRIMARY KEY,
        score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 30),
        FOREIGN KEY (assignmentId) REFERENCES Assignments(id)
      );
    `);
  }
  // Add the evaluation on the assignment and after it will close it.
  async setEvaluation(assignmentId, score) {
    const db = await this.dbPromise;

    // Check if the assignment exsists and is still opened
    const assignment = await db.get(
      `SELECT status FROM Assignments WHERE id = ?`,
      [assignmentId]
    );

    if (!assignment) {
      throw new Error("Assignment does not exist.");
    }

    if (assignment.status !== 'open') {
      throw new Error("Assignment is already closed.");
    }

    // Insert the evaluation
    await db.run(
      `INSERT INTO Evaluations (assignmentId, score) VALUES (?, ?)`,
      [assignmentId, score]
    );

    // Close the assignment
    await db.run(
      `UPDATE Assignments SET status = 'closed' WHERE id = ?`,
      [assignmentId]
    );
  }

  // Retrieve the evaluation of a specific assignment
  async getEvaluation(assignmentId) {
    const db = await this.dbPromise;
    return db.get(
      `SELECT * FROM Evaluations WHERE assignmentId = ?`,
      [assignmentId]
    );
  }

  //  Retrieve all the evaluations for a student (average+ external calculation)
  async getScoresForStudent(studentId) {
    const db = await this.dbPromise;

    return db.all(`
      SELECT E.score, A.id AS assignmentId, COUNT(G2.studentId) AS groupSize
      FROM Evaluations E
      JOIN Assignments A ON A.id = E.assignmentId
      JOIN Groups G1 ON G1.assignmentId = A.id AND G1.studentId = ?
      JOIN Groups G2 ON G2.assignmentId = A.id
      GROUP BY A.id
    `, [studentId]);
  }
}

export default new EvaluationsDAO();
