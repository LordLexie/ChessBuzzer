import {Outlet, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function PrivateRoutes(){
    
    return (Cookies.get('Authorization') ? <Outlet /> : <Navigate to ="/" />)

}

export default PrivateRoutes;