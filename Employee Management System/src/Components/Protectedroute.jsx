import { Navigate, useLocation } from "react-router-dom";
import {
  getCurrentUser,
  getRoleHomePath,
  hasRoleAccess,
} from "../utils/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!hasRoleAccess(user.role, location.pathname)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;