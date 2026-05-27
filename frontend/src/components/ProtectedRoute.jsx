import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-[60vh] grid place-items-center">
        <Spinner size={8} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
