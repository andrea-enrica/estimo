import { Navigate, Outlet } from "react-router-dom";
import { LocalStorageProperties, UserRole } from "../utils/Enums";
import {
  clearAuthenticatedUserData,
  getAuthenticatedUserClaim,
  getAuthenticatedUserDecodedToken
} from "../services/AuthService";
import { RoutePaths } from "../utils/constants/RoutePaths";

interface IProtectedRouteProps {
  roles: Array<keyof typeof UserRole>;
}

const ProtectedRoute = (props: IProtectedRouteProps) => {
  const { roles } = props;
  const userRole = getAuthenticatedUserClaim(LocalStorageProperties.role);
  const userId = getAuthenticatedUserClaim(LocalStorageProperties.id);
  const userToken = getAuthenticatedUserDecodedToken();

  if (!userRole || !userId) {
    return <Navigate to={RoutePaths.LOGIN} />;
  }

  if (userToken.exp * 1000 < Date.now()) {
    clearAuthenticatedUserData();
    return <Navigate to={RoutePaths.LOGIN} />;
  }

  if (roles.includes(userRole as keyof typeof UserRole)) {
    return <Outlet />;
  }
  return <Navigate to={RoutePaths.NOT_FOUND_FORBIDDEN} />;
};

export default ProtectedRoute;
