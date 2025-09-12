import express from 'express';
import assignmentsDAO from '../models/DAO/AssignmentsDAO.js';
import groupsDAO from '../models/DAO/GroupsDAO.js';
import { isTeacher , isStudent } from '../auth/guards.js';
import evaluationsDAO from '../models/DAO/EvaluationsDAO.js';
import { initDB } from '../models/db.js';

const router = express.Router();

//  POST /api/assignments
router.post('/', isTeacher, async (req, res) => {
  const { question, studentIds } = req.body;
  const teacherId = req.user.id;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required.' });
  }

  if (!Array.isArray(studentIds) || studentIds.length < 2 || studentIds.length > 6) {
    return res.status(400).json({ error: 'Group must contain between 2 and 6 students.' });
  }

  try {
    const db = await initDB();
    // Check if an identical assignment already exsists for the same group and teacher
    const placeholders = studentIds.map(() => '?').join(',');
    const matchingAssignments = await db.all(`
      SELECT A.id
      FROM Assignments A
      JOIN Groups G ON G.assignmentId = A.id
      WHERE A.teacherId = ? AND A.question = ?
      GROUP BY A.id
      HAVING COUNT(CASE WHEN G.studentId IN (${placeholders}) THEN 1 END) = ?
         AND COUNT(*) = ?
    `, [teacherId, question, ...studentIds, studentIds.length, studentIds.length]);

    if (matchingAssignments.length > 0) {
      return res.status(200).json({ warning: true, message: 'This assignment has already been assigned to the same group of students.' });
    }

    const assignmentId = await assignmentsDAO.insertAssignmentReturningId(question, teacherId);

    try {
      await groupsDAO.addStudentsToAssignment(assignmentId, studentIds);
      return res.status(201).json({ assignmentId });
    } catch (groupErr) {
      const db = await assignmentsDAO.dbPromise;
      await db.run(`DELETE FROM Assignments WHERE id = ?`, [assignmentId]);
      return res.status(200).json({ warning: true, message: groupErr.message });
    }

  } catch (err) {
    if (err.message.includes('have already worked together')) {
      return res.status(200).json({ warning: true, message: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

router.get('/open', isStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const db = await assignmentsDAO.dbPromise;
    const assignments = await db.all(`
      SELECT A.id, A.question, A.status, A.teacherId
      FROM Assignments A
      JOIN Groups G ON G.assignmentId = A.id
      WHERE G.studentId = ? AND A.status = 'open'
    `, [studentId]);

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero degli assignment.' });
  }
});

router.post('/:id/evaluate', isTeacher, async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const { score } = req.body;

  if (isNaN(assignmentId) || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  if (score < 0 || score > 30) {
    return res.status(400).json({ error: 'Score must be between 0 and 30' });
  }
  try {
    const assignment = await assignmentsDAO.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    const db = await assignmentsDAO.dbPromise;
    const answer = await db.get(`
      SELECT 1 FROM Answers
      WHERE assignmentId = ? AND answerText IS NOT NULL
      LIMIT 1
    `, [assignmentId]);

    if (!answer) {
      return res.status(400).json({ error: 'At least one student must submit an answer before evaluation.' });
    }

    await evaluationsDAO.setEvaluation(assignmentId, score);
    res.status(200).json({ message: 'Evaluation saved and assignment closed' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/open/teacher', isTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const db = await assignmentsDAO.dbPromise;
    const assignments = await db.all(`
      SELECT A.id, A.question, A.status,
             COUNT(DISTINCT Ans.submittedBy) as answerCount
      FROM Assignments A
      LEFT JOIN Answers Ans ON Ans.assignmentId = A.id
      WHERE A.teacherId = ? AND A.status = 'open'
      GROUP BY A.id
    `, [teacherId]);

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching open assignments.' });
  }
});

router.get('/all', isStudent, async (req, res) => {
  const studentId = req.user.id;

  try {
    const db = await assignmentsDAO.dbPromise;
    const assignments = await db.all(`
      SELECT A.id, A.question, A.status, E.score
      FROM Assignments A
      JOIN Groups G ON G.assignmentId = A.id
      LEFT JOIN Evaluations E ON E.assignmentId = A.id
      WHERE G.studentId = ?
    `, [studentId]);

    res.json(assignments);
  } catch (err) {
    console.error('Errore nel recupero di tutti gli assignment:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

export default router;

