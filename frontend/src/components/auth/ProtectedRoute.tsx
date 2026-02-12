import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import AppLayout from '../layout/AppLayout';

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <AppLayout />;
}
