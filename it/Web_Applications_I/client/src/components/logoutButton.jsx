import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LogoutButton.css';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (err) {
      alert('Logout failed');
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;