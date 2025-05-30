
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MessMate...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  return user.role === 'student' ? <Navigate to="/" replace /> : <Navigate to="/admin" replace />;
};

export default Index;
