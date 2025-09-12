import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/userContext'; 
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser(); // log in the global context

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(
      'http://localhost:3001/api/auth/login',
      { username, password },
      {
        withCredentials: true,
        validateStatus: () => true // avoids axios error in console
      }
    );

    if (res.status === 200) {
      setUser(res.data);
      if (res.data.role === 'teacher') navigate('/teacher');
      else if (res.data.role === 'student') navigate('/student');
      else alert('Unrecognized role');
    } else {
      alert(res.data?.error || 'Login failed');
    }

  } catch (err) {
    // Fallback for unexpected axios error
    alert('Unexpected error');
  }
};


  return (
    <div className="login-background">
      <div className="login-circle">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="login-form" autoComplete="off">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder=""
            autoComplete="new-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;


