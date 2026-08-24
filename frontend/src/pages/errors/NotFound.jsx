import { Link } from 'react-router-dom';
import { ShieldQuestion } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { homeRouteForRole } from '../../utils/roleRouting';

export default function NotFound() {
  const { isAuthenticated, user } = useAuth();
  const homeTo = isAuthenticated ? homeRouteForRole(user?.role) : '/login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-azure-50">
        <ShieldQuestion size={30} className="text-azure" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link to={homeTo} className="mt-6">
        <Button>{isAuthenticated ? 'Back to dashboard' : 'Back to login'}</Button>
      </Link>
    </div>
  );
}
