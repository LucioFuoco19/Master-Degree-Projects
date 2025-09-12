import { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import '../assets/dashboard.css';

function TeacherDashboard() {
  const [status, setStatus] = useState([]);
  const [openAssignments, setOpenAssignments] = useState([]);
  const [question, setQuestion] = useState('');
  const [view, setView] = useState('');
  const [grades, setGrades] = useState({});
  const [sort, setSort] = useState('username');
  const [studentList, setStudentList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (view === 'create') {
      loadStudents();
    }
  }, [view]);

  const submitEvaluation = async (assignmentId) => {
  const score = parseInt(grades[assignmentId]);

  if (isNaN(score) || score < 0 || score > 30) {
    return alert('Insert a score between 0 and 30');
  }

  // Check if an answer exists
  if (!answers[assignmentId] || answers[assignmentId].trim() === '') {
    return alert('At least one student must submit an answer before evaluation.');
  }

  try {
    await axios.post(
      `http://localhost:3001/api/assignments/${assignmentId}/evaluate`,
      { score },
      { withCredentials: true }
    );
    alert('Evaluation submitted!');
    loadOpenAssignments();
  } catch (err) {
    const msg = err?.response?.data?.error || 'Error submitting evaluation.';
    alert(msg);
  }
};


  const loadStudents = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/users/students', { withCredentials: true });
      setStudentList(res.data);
    } catch (err) {
      alert('Failed to load students');
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (selectedStudents.length < 2 || selectedStudents.length > 6) {
    alert('Please select between 2 and 6 students.');
    return;
  }

  try {
    const res = await axios.post(
      'http://localhost:3001/api/assignments',
      {
        question,
        studentIds: selectedStudents
      },
      {
        withCredentials: true,
        validateStatus: () => true // Avoid automatic trhow
      }
    );

   if (res.status === 201) {
  alert('Assignment created!');
  setView('');
} else if (res.data?.warning) {
  alert(res.data.message); // Show the advice but is not an error
} else {
  alert(res.data?.error || 'Failed to create assignment.');
}

  } catch (err) {
    console.warn('Network or unexpected error:', err.message);
  }
};


  const loadOpenAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/assignments/open/teacher', { withCredentials: true });
      setOpenAssignments(res.data);
      setView('open');
      const answerMap = {};
      for (const a of res.data) {
        try {
          const response = await axios.get(`http://localhost:3001/api/answers/${a.id}`, { withCredentials: true });
          answerMap[a.id] = response.data?.answerText || '';
        } catch {
          answerMap[a.id] = '';
        }
      }
      setAnswers(answerMap);
    } catch (err) {
      alert('Error loading open assignments');
    }
  };

  const loadClassStatus = async (sortBy = 'username') => {
    try {
      const res = await axios.get(`http://localhost:3001/api/class/status?sort=${sortBy}`, { withCredentials: true });
      setStatus(res.data);
      setSort(sortBy);
      setView('status');
    } catch (err) {
      alert('Error loading class status');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="main-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Teacher Dashboard</h2>
          <LogoutButton />
        </div>

        {view === '' && (
          <div className="dashboard-buttons">
            <button onClick={() => { loadStudents(); setView('create'); }}>Create a new assignment</button>
            <button onClick={loadOpenAssignments}>Opened assignments</button>
            <button onClick={loadClassStatus}>Class state</button>
          </div>
        )}

        {view === 'create' && (
          <div className="dashboard-section">
            <h3 className="section-title">Create a new assignment</h3>
            <form className="assignment-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Write the question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
              <p>Select between 2 and 6 students:</p>
              <div className="student-list">
                {studentList.map(s => (
                  <label key={s.id}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(prev => [...prev, s.id]);
                        } else {
                          setSelectedStudents(prev => prev.filter(id => id !== s.id));
                        }
                      }}
                    />
                    {s.username}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button type="submit">Create</button>
                <button type="button" onClick={() => setView('')} style={{ marginLeft: '10px' }}>🔙 Back</button>
              </div>
            </form>
          </div>
        )}

        {view === 'open' && (
          <div className="dashboard-section">
            <h3 className="section-title">Assignments created by you</h3>
            {openAssignments.length === 0 ? (
              <p>No open assignments.</p>
            ) : (
              openAssignments.map(a => (
                <div key={a.id} className="assignment-card">
                  <p><strong>Question:</strong> {a.question}</p>
                  <p><strong>State:</strong> {a.status}</p>
                  <p><strong>Last Response:</strong> {answers[a.id] || <em>No response yet</em>}</p>
                  <input
                    type="number"
                    placeholder="Score (0-30)"
                    value={grades[a.id] || ''}
                    onChange={(e) => setGrades({ ...grades, [a.id]: e.target.value })}
                    min="0"
                    max="30"
                  />
                  <button onClick={() => submitEvaluation(a.id)}>Insert evaluation</button>
                </div>
              ))
            )}
            <button onClick={() => setView('')}>🔙 Back</button>
          </div>
        )}

        {view === 'status' && (
          <div className="dashboard-section">
            <h3 className="section-title">Class Status</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>Sort by: </label>
              <select value={sort} onChange={(e) => loadClassStatus(e.target.value)}>
                <option value="username">Alphabetical</option>
                <option value="total">Total Assignments</option>
                <option value="average">Average Score</option>
              </select>
            </div>
            {status.length === 0 ? (
              <p>No available data.</p>
            ) : (
              <table className="status-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Open</th>
                    <th>Closed</th>
                    <th>Total</th>
                    <th>Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {status.map(row => (
                    <tr key={row.id}>
                      <td>{row.username}</td>
                      <td>{row.open}</td>
                      <td>{row.closed}</td>
                      <td>{row.total}</td>
                      <td>{row.average ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={() => setView('')}>🔙 Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
