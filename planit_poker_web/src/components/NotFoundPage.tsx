import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { RoutePaths } from "../utils/constants/RoutePaths";

export default function NotFoundPage() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <>
          <Link to={RoutePaths.ADMIN_USER_MANAGER_HOME}>
            <Button type="primary">Back to Home Page</Button>
          </Link>
          <Link to={RoutePaths.LOGIN}>
            <Button type="primary">Back to Login</Button>
          </Link>
        </>
      }
    />
  );
}
