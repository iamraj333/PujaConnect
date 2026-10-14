import { Navigate, Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { MyContextData } from "../ContextData/MyContextData";
import { toast } from "react-toastify";

export default function ProtectedRoute({ allowedRoles }) {
    const { currentUser, loading } = useContext(MyContextData);
    const isUnauthorized = !loading && currentUser.user && !allowedRoles.includes(currentUser.role);

    useEffect(() => {
        if (isUnauthorized) {
            toast.warn("Page not accessible for you");
        }
    }, [isUnauthorized]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!currentUser.user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(currentUser.role)) return (<Navigate to="/" replace />);

    return <Outlet />;
}