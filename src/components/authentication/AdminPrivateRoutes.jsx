import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function AdminPrivateRoutes() {
    const { auth } = useAuth();
    return auth?.role === 'admin' ? <Outlet /> : <Navigate to="/admin" />;
}

export default AdminPrivateRoutes;
