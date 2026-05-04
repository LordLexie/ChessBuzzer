import { useState, createContext } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        try {
            const adminInfo = localStorage.getItem('adminInfo');
            if (adminInfo) return JSON.parse(adminInfo);
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : {};
        } catch {
            return {};
        }
    });

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;