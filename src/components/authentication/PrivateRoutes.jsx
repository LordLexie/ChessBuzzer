import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function PrivateRoutes() {
    const { auth } = useAuth();
    return auth?.user_id ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoutes;