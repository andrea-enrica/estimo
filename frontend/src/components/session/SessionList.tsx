import {useEffect, useRef, useState} from "react";
import {Button, Empty, Flex, Typography} from "antd";
import {SessionDto} from "../../utils/dtos/SessionDto";
import SessionInfo from "./SessionInfo";
import {CheckOutlined, FormOutlined, PlusOutlined, UserAddOutlined} from "@ant-design/icons";
import {
  useGetManagedSessionsQuery, useGetSessionQuery,
  useGetSessionsByUserInvitedQuery,
  useGetSessionsByUserParticipatedQuery,
  useSaveSessionMutation, useUpdateSessionStatusMutation
} from "../../api/SessionApi";
import {useAssignManagerToSessionMutation, useGetUserProfileQuery} from "../../api/UserApi";
import "../../styles/Session.css";
import {getAuthenticatedUserClaim} from "../../services/AuthService";
import {FilterSessionsEnum, LocalStorageProperties, UserRole} from "../../utils/Enums";
import {useLocation} from "react-router-dom";
import CustomDashboard from "../user/CustomDashboard";
import CreateSessionModal from "../session/CreateSessionModal";
import useNotifier from "../hooks/useNotifier";
import {useCreateStoriesMutation} from "../../api/StoryApi";
import {CreateStoryDto} from "../../utils/dtos/CreateStoryDto";
import CreateStoryModal from "../story/CreateStoryModal";

export default function SessionsList() {
  const role = getAuthenticatedUserClaim(LocalStorageProperties.role);
  const authUserId = Number(
    getAuthenticatedUserClaim(LocalStorageProperties.id)
  );

  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [filter, setFilter] = useState<string>(FilterSessionsEnum.SESSIONS);
  const [createSessionModal, setCreateSessionModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newSessionId, setNewSessionId] = useState<number>(0);
  const [createStoryModalVisible, setCreateStoryModalVisible] = useState(false);
  const { data: managedSessions, isSuccess: isManagedSessionSuccess, refetch: refetchManagedSessions } = useGetManagedSessionsQuery(authUserId, {
    skip: role !== UserRole.MANAGER
  });
  const { data: userParticipatedSessions, isSuccess: isUserSessionSuccess, refetch: refetchUserSessions } =
    useGetSessionsByUserParticipatedQuery(authUserId || 0);
  const { data: userInvitedSessions, refetch: refetchInvited } =
    useGetSessionsByUserInvitedQuery(authUserId || 0);
  const { data: userDetails } = useGetUserProfileQuery({
    userId: Number(getAuthenticatedUserClaim(LocalStorageProperties.id))
  });
  const [saveSession] = useSaveSessionMutation();
  const [assignManager] = useAssignManagerToSessionMutation();
  const [createStories] = useCreateStoriesMutation();
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    openSuccessNotification,
    openErrorNotification,
    openNotification,
    contextHolder
  } = useNotifier();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (filter === FilterSessionsEnum.MANAGED) {
      setSessions(managedSessions || []);
    } else if (filter === FilterSessionsEnum.SESSIONS) {
      setSessions(userParticipatedSessions || []);
    } else if (filter === FilterSessionsEnum.INVITED) {
      setSessions(userInvitedSessions || []);
    } else {
      setSessions([]);
    }
  }, [
    filter,
    managedSessions,
    userParticipatedSessions,
    userInvitedSessions,
    authUserId
  ]);

  useEffect(() => {
    const userDisconnected = localStorage.getItem(
      LocalStorageProperties.userDisconnected
    );
    if (userDisconnected) {
      const { sessionTitle } = JSON.parse(userDisconnected);
      openNotification(
        "info",
        "Disconnected",
        `You have been disconnected from the session ${sessionTitle}`,
        "topRight"
      );
      localStorage.removeItem(LocalStorageProperties.userDisconnected);
    }
  }, [openNotification]);

  useEffect(() => {
    if(isManagedSessionSuccess) {
      refetchManagedSessions();
    }
    if(isUserSessionSuccess) {
      refetchUserSessions();
    }
  }, [isManagedSessionSuccess, isUserSessionSuccess]);

  const getManagedSessions = () => {
    setFilter(FilterSessionsEnum.MANAGED);
  };

  const getParticipatedInSessions = () => {
    setFilter(FilterSessionsEnum.SESSIONS);
  };

  const getInvitedInSessions = () => {
    setSessions([]);
    setFilter(FilterSessionsEnum.INVITED);
    refetchInvited();
  };

  const toggleCreateSessionModal = () => {
    setCreateSessionModalOpen(!createSessionModal);
  };

  const toggleCreateStoryModal = () => {
    setCreateStoryModalVisible(!createStoryModalVisible);
  };

  const handleSubmitCreateSession = async (session: SessionDto) => {
    try {
      await saveSession({ newSession: session })
        .unwrap()
        .then((payload: SessionDto) => {
          assignManager({ request: payload });
          setNewSessionId(payload.id);
        });
      openSuccessNotification(
        `The session ${session.title} has been added. You can now manage it and join it anytime.`
      );
      toggleCreateStoryModal();
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  const handleSubmitCreateStoryList = async (newStories: CreateStoryDto[]) => {
    try {
      await createStories({ newStories });
      openSuccessNotification(`Stories added.`);
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
      <CustomDashboard
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        currentPath={currentPath}
      />

      <div className={`sessionsContainer ${isOpen ? "shifted" : ""}`}>
        <div className="filterButtons">
          <Flex gap="large" align="center" justify="center" wrap>
            {role === UserRole.MANAGER && (
              <Button
                icon={<PlusOutlined />}
                onClick={toggleCreateSessionModal}
                type="primary"
                className="primary-button"
                size="large"
              >
                {FilterSessionsEnum.CREATE_SESSION}
              </Button>
            )}
            {role === UserRole.MANAGER && (
              <Button
                icon={<FormOutlined />}
                onClick={getManagedSessions}
                className="primary-button"
                type="primary"
                size="large"
              >
                {FilterSessionsEnum.MANAGED}
              </Button>
            )}
            <Button
              icon={<UserAddOutlined />}
              onClick={getInvitedInSessions}
              className="primary-button"
              type="primary"
              size="large"
            >
              {FilterSessionsEnum.INVITED}
            </Button>
            <Button
              icon={<CheckOutlined />}
              onClick={getParticipatedInSessions}
              className="primary-button"
              type="primary"
              size="large"
            >
              {FilterSessionsEnum.SESSIONS}
            </Button>
          </Flex>
        </div>

        <div className="active-filter">
          <h2>
            {FilterSessionsEnum.SHOWING}{": "}
            {filter.charAt(0) + filter.slice(1)}
          </h2>
        </div>

        <div className={`sessionGrid ${sessions.length === 0 ? "empty" : ""}`}>
          {sessions.length === 0 ? (
            <Empty
              description={
                <Typography.Text>
                  {FilterSessionsEnum.NO_SESSIONS}
                </Typography.Text>
              }
            />
          ) : (
            sessions.map((session: SessionDto) => (
              <SessionInfo
                session={session}
                key={session.id}
                userId={authUserId as number}
                filter={filter}
              />
            ))
          )}

          {createSessionModal && userDetails && (
            <CreateSessionModal
              onOk={handleSubmitCreateSession}
              onClose={toggleCreateSessionModal}
              userDetails={userDetails}
              creatorId={Number(userDetails.id)}
            />
          )}
        </div>
        {createStoryModalVisible && (
          <CreateStoryModal
            onAddList={handleSubmitCreateStoryList}
            onClose={toggleCreateStoryModal}
            sessionId={newSessionId}
            showButton={true}
          />
        )}
      </div>
    </>
  );
}
