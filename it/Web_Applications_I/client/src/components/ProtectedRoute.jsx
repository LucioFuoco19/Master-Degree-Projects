import { Navigate } from 'react-router-dom';
import { useUser } from '../context/userContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;

