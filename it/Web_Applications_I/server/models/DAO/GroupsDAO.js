import { initDB } from '../db.js';
class GroupsDAO {
  constructor() {
    this.dbPromise = initDB();
  }
  async createTable() {
    const db = await this.dbPromise;
    await db.run(`
      CREATE TABLE IF NOT EXISTS Groups (
        assignmentId INTEGER,
        studentId INTEGER,
        PRIMARY KEY (assignmentId, studentId),
        FOREIGN KEY (assignmentId) REFERENCES Assignments(id),
        FOREIGN KEY (studentId) REFERENCES Users(id)
      );
    `);
  }
async getUsernameById(id) {
  const db = await this.dbPromise;
  const user = await db.get(`SELECT username FROM Users WHERE id = ?`, [id]);
  return user?.username || `ID ${id}`;
}

async addStudentsToAssignment(assignmentId, studentIds) {
  const db = await this.dbPromise;

  if (studentIds.length < 2 || studentIds.length > 6) {
    throw new Error('Group must contain between 2 and 6 students.');
  }

  // Check if any pair of students has already worked together 2 or more times 
  for (let i = 0; i < studentIds.length; i++) {
    for (let j = i + 1; j < studentIds.length; j++) {
      const s1 = studentIds[i];
      const s2 = studentIds[j];

      const result = await db.get(`
        SELECT COUNT(DISTINCT g1.assignmentId) as count
        FROM Groups g1
        JOIN Groups g2 ON g1.assignmentId = g2.assignmentId
        WHERE g1.studentId = ? AND g2.studentId = ?
      `, [s1, s2]);

      if (result.count >= 2) {
        const [name1, name2] = await Promise.all([
          this.getUsernameById(s1),
          this.getUsernameById(s2)
        ]);
        throw new Error(`Students ${name1} and ${name2} have already worked together in ${result.count} assignments.`);
      }
    }
  }
  for (const studentId of studentIds) {
    await db.run(`
      INSERT INTO Groups (assignmentId, studentId)
      VALUES (?, ?)
    `, [assignmentId, studentId]);
  }

  return true;
}

  async getGroupByAssignmentId(assignmentId) {
    const db = await this.dbPromise;
    return db.all(`
      SELECT u.id, u.username
      FROM Groups g
      JOIN Users u ON g.studentId = u.id
      WHERE g.assignmentId = ?`,
      [assignmentId]
    );
  }
  async getAssignmentsForStudent(studentId) {
    const db = await this.dbPromise;
    return db.all(`
      SELECT a.*
      FROM Groups g
      JOIN Assignments a ON a.id = g.assignmentId
      WHERE g.studentId = ?`,
      [studentId]
    );
  }
  async isStudentInGroup(assignmentId, studentId) {
  const db = await this.dbPromise;
  const result = await db.get(`
    SELECT * FROM Groups
    WHERE assignmentId = ? AND studentId = ?
  `, [assignmentId, studentId]);

  return !!result;
}
}
export default new GroupsDAO();