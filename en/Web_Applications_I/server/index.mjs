// ------------------- IMPORTS -------------------
import express from 'express';
import session from 'express-session';
import passport from './auth/passport-config.js';
import cors from 'cors';

import userDAO from './models/DAO/UserDAO.js';
import groupsDAO from './models/DAO/GroupsDAO.js';
import evaluationsDAO from './models/DAO/EvaluationsDAO.js';
import assignmentsDAO from './models/DAO/AssignmentsDAO.js';
import answersDAO from './models/DAO/AnswersDAO.js';

import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import answersRoutes from './routes/answers.js';
import classRoutes from './routes/class.js';
import userRoutes from './routes/users.js';
import evaluationsRoutes from './routes/evaluations.js';

// ------------------- INIT EXPRESS -------------------
const app = express();
const port = 3001;
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // body parser JSON
// ------------------- SESSION + PASSPORT -------------------
app.use(session({
  secret: 'lucio-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {next();});

// ------------------- ROUTES -------------------
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/class', classRoutes);
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationsRoutes);

// ------------------- INIT DATABASE -------------------
await userDAO.createTable();
await assignmentsDAO.createTable();
await groupsDAO.createTable();
await answersDAO.createTable();
await evaluationsDAO.createTable();

// ------------------- TEST USERS -------------------
try {
  await userDAO.insertUser('lucio', 'password123', 'teacher');
  await userDAO.insertUser('teacher2', 'password456', 'teacher');
  for (let i = 1; i <= 20; i++) {
  await userDAO.insertUser(`student${i}`, 'pass123', 'student');
}

} catch (err) {
  if (err.code !== 'SQLITE_CONSTRAINT') {
    console.error('Errore while declaring users:', err);
  }
}

// ------------------- ASSIGNMENT + GROUP + ANSWER + EVALUATION -------------------
try {
  const id1 = await assignmentsDAO.insertAssignmentReturningId('Question 1', 1);
await groupsDAO.addStudentsToAssignment(id1, [2, 3]);
await answersDAO.upsertAnswer(id1, 'Answer 1...', 2);
await evaluationsDAO.setEvaluation(id1, 27); // <-- Closed

const id2 = await assignmentsDAO.insertAssignmentReturningId('Question 2', 1);
await groupsDAO.addStudentsToAssignment(id2, [4, 5]); // different group
// no answer/evaluation --> assignment still OPEN

} catch (err) {
  console.error('Errore while initializing test data:', err);
}

// ------------------- Starting SERVER -------------------
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});