import express from 'express';
import { isStudent } from '../auth/guards.js';
import { initDB } from '../models/db.js';

const router = express.Router();

// GET /api/evaluations/me
router.get('/me', isStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const db = await initDB();
    //Retrieve all closed and evaluated assignments involving the current student 
    const rows = await db.all(`
      SELECT A.id AS assignmentId, A.question, E.score, COUNT(G2.studentId) AS groupSize
      FROM Assignments A
      JOIN Groups G ON G.assignmentId = A.id
      JOIN Evaluations E ON E.assignmentId = A.id
      JOIN Groups G2 ON G2.assignmentId = A.id
      WHERE A.status = 'closed' AND G.studentId = ?
      GROUP BY A.id
    `, [studentId]);

    const weightedScores = rows.map(r => r.score / r.groupSize);
    const average = weightedScores.length > 0
      ? (weightedScores.reduce((a, b) => a + b, 0) / weightedScores.length)
      : null;

    res.json({
      evaluations: rows.map(r => ({
        assignmentId: r.assignmentId,
        question: r.question,
        score: r.score,
        groupSize: r.groupSize
      })),
      average: average !== null ? average.toFixed(2) : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error while retrieving evaluations.' });
  }
});

export default router;
