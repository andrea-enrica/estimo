import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCheckUserSessionAssignmentQuery} from "../api/SessionApi";
import {Spin} from "antd";
import {RoutePaths} from "../utils/constants/RoutePaths";

interface ISessionRouteGuardProps {
  sessionId: number;
  userId: number;
  children: React.ReactNode;
}

const SessionRouteGuard = (props: ISessionRouteGuardProps) => {
  const { sessionId, userId, children } = props;

  const navigate = useNavigate();

  const {
    data: isAssigned,
    isLoading,
    error
  } = useCheckUserSessionAssignmentQuery({
    sessionId,
    userId
  });

  useEffect(() => {
    if (!isLoading) {
      if (error || !isAssigned) {
        navigate(RoutePaths.NOT_FOUND_FORBIDDEN, { replace: true });
      }
    }
  }, [error, isAssigned, isLoading, navigate]);

  if (isLoading) {
    return <Spin size="large" />;
  }

  return <>{children}</>;
};

export default SessionRouteGuard;
