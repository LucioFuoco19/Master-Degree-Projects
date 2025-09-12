import { useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import '../assets/dashboard.css';

function StudentDashboard() {
  const [view, setView] = useState('');
  const [allAssignments, setAllAssignments] = useState([]);
  const [openAssignments, setOpenAssignments] = useState([]);
  const [closedAssignments, setClosedAssignments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [average, setAverage] = useState(null);

  const loadAllAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/assignments/all', {
        withCredentials: true
      });
      setAllAssignments(res.data);
      setView('all');
    } catch (err) {
      alert('Error while loading all the assignments');
    }
  };

  const loadOpenAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/assignments/open', {
        withCredentials: true
      });
      setOpenAssignments(res.data);
      setView('open');
    } catch (err) {
      alert('Error while loading the open assignments');
    }
  };

  const loadClosedAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/evaluations/me', {
        withCredentials: true
      });
      setClosedAssignments(res.data.evaluations);
      setAverage(res.data.average);
      setView('closed');
    } catch (err) {
      alert('Error while loading the closed assignments');
    }
  };

  const submitAnswer = async (assignmentId) => {
  const answer = answers[assignmentId];

  if (!answer || answer.trim() === '') {
    alert('Answer cannot be empty.');
    return;
  }

  try {
    await axios.post(
      `http://localhost:3001/api/answers/${assignmentId}`,
      { answerText: answer },
      { withCredentials: true }
    );
    alert('Answer saved!');
  } catch (err) {
    const msg = err?.response?.data?.error || 'Error saving the answer.';
    alert(msg);
  }
};

  return (
    <div className="dashboard-container">
      <div className="main-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Student Dashboard</h2>
          <LogoutButton />
        </div>

        {view === '' && (
          <div className="dashboard-buttons">
            <button onClick={loadAllAssignments}>📖 View all assignments</button>
            <button onClick={loadOpenAssignments}>📘 Assignments (open)</button>
            <button onClick={loadClosedAssignments}>📊 View average and evaluation scores</button>
          </div>
        )}

        {view === 'all' && (
          <div className="dashboard-section">
            <h3 className="section-title">All Assignments</h3>
            {allAssignments.length === 0 ? (
              <p>No assignments found.</p>
            ) : (
              <ul>
                {allAssignments.map(a => (
                  <li key={a.id}>
                    <strong>{a.question}</strong> — status: {a.status} — Evaluation: {a.score ?? 'N/A'}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setView('')}>🔙 Back</button>
          </div>
        )}

        {view === 'open' && (
          <div className="dashboard-section">
            <h3 className="section-title">Open Assignments</h3>
            {openAssignments.length === 0 ? (
              <p>No open assignments.</p>
            ) : (
              openAssignments.map(a => (
                <div key={a.id} className="assignment-card">
                  <h4>{a.question}</h4>
                  <textarea
                    placeholder="Write or modify the answer"
                    value={answers[a.id] ?? ''}
                    onChange={(e) => setAnswers({ ...answers, [a.id]: e.target.value })}
                    rows={3}
                  />
                  <button onClick={() => submitAnswer(a.id)}>Save answer</button>
                </div>
              ))
            )}
            <button onClick={() => setView('')}>🔙 Back</button>
          </div>
        )}

        {view === 'closed' && (
          <div className="dashboard-section">
            <h3 className="section-title">Evaluated Assignments</h3>
            {closedAssignments.length === 0 ? (
              <p>No evaluated assignments found.</p>
            ) : (
              <>
                <table className="status-table">
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedAssignments.map((a, index) => (
                      <tr key={index}>
                        <td>{a.question ?? `Assignment #${a.assignmentId}`}</td>
                        <td>{a.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {average !== null && (
                  <p>📊 Average Score: <strong>{average}</strong></p>
                )}
              </>
            )}
            <button onClick={() => setView('')}>🔙 Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;







