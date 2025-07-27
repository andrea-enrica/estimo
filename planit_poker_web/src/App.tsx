import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider
} from "react-router-dom";
import "./App.css";
import LoginPage from "./components/LoginPage";
import AdminUserList from "./components/admin/AdminUserList";
import NotFoundPage from "./components/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserRole } from "./utils/Enums";
import SessionsList from "./components/session/SessionList";
import UserHomePage from "./components/user/UserHomePage";
import AdminSessionsList from "./components/admin/AdminSessionsList";
import SessionPage from "./components/session/SessionPage";
import { RoutePaths } from "./utils/constants/RoutePaths";
import StatisticEndGame from "./components/session/endgame/StatisticEndGame";

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={RoutePaths.LANDING_PAGE} element={<LoginPage />}></Route>
      <Route path={RoutePaths.LOGIN} element={<LoginPage />}></Route>

      <Route element={<ProtectedRoute roles={[UserRole.ADMIN]} />}>
        <Route
          path={RoutePaths.ADMIN_USERS}
          element={<AdminUserList />}
        ></Route>
        <Route
          path={RoutePaths.ADMIN_SESSIONS}
          element={<AdminSessionsList />}
        ></Route>
      </Route>

      <Route
        element={<ProtectedRoute roles={[UserRole.MANAGER, UserRole.USER]} />}
      >
        <Route
          path={RoutePaths.USER_MANAGER_SESSIONS}
          element={<SessionsList />}
        ></Route>
      </Route>

      <Route
        element={
          <ProtectedRoute
            roles={[UserRole.MANAGER, UserRole.USER, UserRole.ADMIN]}
          />
        }
      >
        <Route
          path={RoutePaths.SESSION_OVERVIEW}
          element={<SessionPage />}
        ></Route>
        <Route
          path={RoutePaths.SESSION_ENDED}
          element={<StatisticEndGame />}
        ></Route>
        <Route
          path={RoutePaths.ADMIN_USER_MANAGER_HOME}
          element={<UserHomePage />}
        ></Route>
      </Route>
      <Route
        path={RoutePaths.NOT_FOUND_FORBIDDEN}
        element={<NotFoundPage />}
      ></Route>
    </>
  )
);

function App() {
  return (
    <div className="App">
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
