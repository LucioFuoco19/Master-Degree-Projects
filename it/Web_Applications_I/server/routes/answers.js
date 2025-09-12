import express from 'express';
import answersDAO from '../models/DAO/AnswersDAO.js';
import assignmentsDAO from '../models/DAO/AssignmentsDAO.js';
import groupsDAO from '../models/DAO/GroupsDAO.js';
import { isLoggedIn, isStudent } from '../auth/guards.js';

const router = express.Router();

/*
 POST /api/answers/:assignmentId
 Allow a student to submit an answer 
*/
router.post('/:assignmentId', isStudent, async (req, res) => {
  const assignmentId = parseInt(req.params.assignmentId);
  const { answerText } = req.body;
  const studentId = req.user.id;

  if (!answerText || answerText.trim() === '') {
  return res.status(400).json({ error: 'Answer cannot be empty' });
  }

  try {
    await answersDAO.upsertAnswer(assignmentId, answerText, studentId);
    res.status(200).json({ message: 'Answer saved/updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*
 GET /api/answers/:assignmentId
Teacher → Can read all the answers on the assignments made by him
Student → Only if they are in the group
*/
router.get('/:assignmentId', isLoggedIn, async (req, res) => {
  const assignmentId = parseInt(req.params.assignmentId);
  const user = req.user;

  if (isNaN(assignmentId)) {
    return res.status(400).json({ error: 'Invalid assignment ID' });
  }

  try {
    const assignment = await assignmentsDAO.getAssignmentById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Teacher → Can read everything
    if (user.role === 'teacher') {
      const answer = await answersDAO.getAnswer(assignmentId);
      return res.json(answer ?? {});
    }

    // Student → Only if it's in the group
    const isInGroup = await groupsDAO.isStudentInGroup(assignmentId, user.id);
    if (!isInGroup) return res.status(403).json({ error: 'Forbidden: not part of this group' });

    const answer = await answersDAO.getAnswer(assignmentId);
    return res.json(answer ?? {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


