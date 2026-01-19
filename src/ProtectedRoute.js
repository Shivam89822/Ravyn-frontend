import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  
  if (!isAuthChecked) {
    return null;
  }

 
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
