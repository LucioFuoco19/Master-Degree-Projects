import express from 'express';
import { isTeacher } from '../auth/guards.js';
import { initDB } from '../models/db.js';

const router = express.Router();

// GET /api/class/status 
router.get('/status', isTeacher, async (req, res) => {
  try {
    const db = await initDB();
    const sortBy = req.query.sort || 'username'; // valore di default
    const teacherId = req.user.id;

    const students = await db.all(`
      SELECT id, username
      FROM Users
      WHERE role = 'student'
    `);

    const results = [];

    for (const student of students) {
      const openAssignments = await db.get(`
        SELECT COUNT(*) AS count
        FROM Groups G
        JOIN Assignments A ON A.id = G.assignmentId
        WHERE G.studentId = ? AND A.status = 'open' AND A.teacherId = ?
      `, [student.id, teacherId]);

      const closedAssignments = await db.get(`
        SELECT COUNT(*) AS count
        FROM Groups G
        JOIN Assignments A ON A.id = G.assignmentId
        WHERE G.studentId = ? AND A.status = 'closed' AND A.teacherId = ?
      `, [student.id, teacherId]);

      const evaluations = await db.all(`
        SELECT E.score, COUNT(G2.studentId) AS groupSize
        FROM Groups G
        JOIN Assignments A ON A.id = G.assignmentId
        JOIN Evaluations E ON E.assignmentId = A.id
        JOIN Groups G2 ON G2.assignmentId = A.id
        WHERE G.studentId = ? AND A.teacherId = ?
        GROUP BY A.id
      `, [student.id, teacherId]);

      const weightedScores = evaluations.map(e => e.score / e.groupSize);
      const average = weightedScores.length > 0
        ? (weightedScores.reduce((a, b) => a + b, 0) / weightedScores.length)
        : null;

      results.push({
        id: student.id,
        username: student.username,
        open: openAssignments.count,
        closed: closedAssignments.count,
        total: openAssignments.count + closedAssignments.count,
        average: average
      });
    }

    //Sorting
    if (sortBy === 'username') {
      results.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === 'total') {
      results.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'average') {
      results.sort((a, b) => {
        if (a.average === null) return 1;
        if (b.average === null) return -1;
        return b.average - a.average;
      });
    }

    // Fixing the averages
    results.forEach(r => {
      if (r.average !== null) r.average = r.average.toFixed(2);
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error while calculating class status' });
  }
});

export default router;

