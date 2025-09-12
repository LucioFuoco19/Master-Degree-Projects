import express from 'express';
import userDAO from '../models/DAO/UserDAO.js';
import { isLoggedIn, isTeacher } from '../auth/guards.js';
import { initDB } from '../models/db.js';

const router = express.Router();
//  Retrieve the list of all students. Only theachers can access this endpoin.
router.get('/students', isTeacher, async (req, res) => {
  try {
    const students = await userDAO.getAllStudents();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load students' });
  }
});


/* Allow viewing all the evaluation of a specific student (by ID).
Calculates weighted average as score/groupSize.*/
router.get('/:id/evaluations', isLoggedIn, async (req, res) => {
  const studentId = parseInt(req.params.id);
  const requesterId = req.user.id;

  if (isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  // security:  the student can only see himself
  if (req.user.role === 'student' && studentId !== requesterId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const db = await initDB();
    const user = await db.get(`SELECT username FROM Users WHERE id = ? AND role = 'student'`, [studentId]);
    if (!user) return res.status(404).json({ error: 'Student not found' });
    const evaluations = await db.all(`
      SELECT A.id AS assignmentId, E.score, COUNT(G2.studentId) AS groupSize
      FROM Groups G
      JOIN Assignments A ON A.id = G.assignmentId
      JOIN Evaluations E ON E.assignmentId = A.id
      JOIN Groups G2 ON G2.assignmentId = A.id
      WHERE G.studentId = ?
      GROUP BY A.id
    `, [studentId]);
    const weightedScores = evaluations.map(e => e.score / e.groupSize);
    const average = weightedScores.length > 0
      ? (weightedScores.reduce((a, b) => a + b, 0) / weightedScores.length).toFixed(2)
      : null;
    res.json({
      studentId,
      username: user.username,
      evaluations,
      average
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
