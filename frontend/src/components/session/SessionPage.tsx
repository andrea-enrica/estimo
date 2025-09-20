import {useNavigate, useParams} from "react-router-dom";
import {useCallback, useEffect, useRef, useState} from "react";
import {mapUsersToOptions} from "../../services/SessionService";
import InviteUsersModal from "./InviteUsersModal";
import {useGetUserProfileQuery, useGetUsersProfilesQuery} from "../../api/UserApi";
import PokerTable from "../table/PokerTable";
import "../../styles/MainGame.css";
import {Alert, Flex, FloatButton, SelectProps, Spin} from "antd";
import {QuestionOutlined} from "@ant-design/icons";
import SockJS from "sockjs-client";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {getAuthenticatedUserClaim} from "../../services/AuthService";
import {LocalStorageProperties, SessionStatus, UserRole, UserSessionRole} from "../../utils/Enums";
import {UserMessageDto} from "../../utils/dtos/UserMessageDto";
import {CardDto} from "../../utils/dtos/CardDto";
import SessionRouteGuard from "../SessionRouteGuard";
import {
    useGetSessionQuery,
    useGetSessionRoleAuthUserQuery,
    useUpdateSessionStatusMutation,
    useUpdateUserSessionRoleMutation
} from "../../api/SessionApi";
import {SessionDto} from "../../utils/dtos/SessionDto";
import {UserProfileDto} from "../../utils/dtos/UserProfileDto";
import FooterCardSelection from "../table/FooterCardSelection";
import {CardSelectionDto} from "../../utils/dtos/CardSelectionDto";
import {useCreateStoryMutation, useGetStoriesQuery} from "../../api/StoryApi";
import {RoutePaths} from "../../utils/constants/RoutePaths";
import useNotifier from "../hooks/useNotifier";
import SessionControlDashboard from "./SessionControlDashboard";
import {StoryDto} from "../../utils/dtos/StoryDto";
import appConfig from "../../config";
import {CreateStoryDto} from "../../utils/dtos/CreateStoryDto";
import LeaveSessionModal from "./LeaveSessionModal";
import AddFeedbackModal from "./AddFeedbackModal";
import SessionTimer from "./SessionTimer";
import Title from "antd/es/typography/Title";
import SessionListsCard from "./SessionListsCard";
import {UserSessionDetailsDto} from "../../utils/dtos/UserSessionDetailsDto";

export default function SessionPage() {
  const token = getAuthenticatedUserClaim(LocalStorageProperties.token);
  const authUserRole: string =
    getAuthenticatedUserClaim(LocalStorageProperties.role)?.toString() || "";
  const authUserId: number = Number(
    getAuthenticatedUserClaim(LocalStorageProperties.id)
  );

  const serverUrl = `${appConfig.serverUrl}=${token}`;
  const { id } = useParams();

  const [users, setUsers] = useState<UserMessageDto[]>([]);
  const [cards, setCards] = useState<CardDto[]>([]);

  const [estimationCards, setEsimationCards] = useState<CardDto[]>([]);
  const [viewVotes, setViewVotes] = useState<boolean>(false);

  const [openParticipants, setOpenParticipants] = useState<boolean>(false);
  const [openStories, setOpenStories] = useState<boolean>(false);
  const [usersOptions, setUsersOptions] = useState<SelectProps["options"]>([]);

  const [inviteUsersModal, setInviteUsersModal] = useState<boolean>(false);
  const [leaveSessionModal, setLeaveSessionModal] = useState<boolean>(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const stompClientRef = useRef<CompatClient | null>(null);

  const navigate = useNavigate();
  const {
    openSuccessNotification,
    openErrorNotification,
    openNotification,
    contextHolder
  } = useNotifier();
  const [startTime, setStartTime] = useState<number>(0);
  const [hasRefreshed, setHasRefreshed] = useState<boolean>(false);

  const { data: userDetails } = useGetUserProfileQuery({
    userId: Number(getAuthenticatedUserClaim(LocalStorageProperties.id))
  });
  const { data: session } = useGetSessionQuery(Number(id));
  const {
    data: storyList,
    isLoading,
    refetch: refetchStories,
  } = useGetStoriesQuery({
    sessionId: Number(id)
  });
  const { data: givenAuthUserSessionRole, refetch: refetchRole } =
    useGetSessionRoleAuthUserQuery({
      sessionId: Number(id),
      userId: Number(authUserId)
    });

  const [createStory] = useCreateStoryMutation();
  const [updateSessionStatus] = useUpdateSessionStatusMutation();
  const [updateUserSessionRole] = useUpdateUserSessionRoleMutation();

  const [stories, setStories] = useState(storyList || []);
  const { data: allUsers } = useGetUsersProfilesQuery();

  const [sessionData, setSessionData] = useState<SessionDto | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardSelectionDto | null>(
    null
  );
  const [cardsSelection, setCardsSelection] = useState<CardSelectionDto[]>([]);

  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentStory, setCurrentStory] = useState<StoryDto | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [currentStoryAverage, setCurrentStoryAverage] = useState<string>("N/A");
  const [open, setOpen] = useState<boolean>(false);

  const [estimationProgressPercent, setEstimationProgressPercent] =
    useState<number>(0);
  const [storyIdNumber, setStoryIdNumber] = useState<number>(0);
  const storiesRef = useRef(stories);
  const [isStoryInProgress, setIsStoryInProgress] = useState<boolean>(false);
  const [isOpenFeedback, setIsOpenFeedback] = useState(false);
  const [authUserSessionRole, setAuthUserSessionRole] =
    useState<UserSessionRole>(UserSessionRole.USER);

  useEffect(() => {
    if (givenAuthUserSessionRole) {
      setAuthUserSessionRole(givenAuthUserSessionRole);
    }
  }, [givenAuthUserSessionRole, authUserId]);

  const messageHandler = useCallback(
    (userDetails: UserProfileDto): UserMessageDto => {
      refetchRole();
      const message: UserMessageDto = {
        userId: userDetails.id,
        userFullName: userDetails.fullName,
        sessionId: Number(id),
        storyId: storyIdNumber,
        estimation: "",
        votedTime: new Date().toISOString(),
        hasVoted: false,
        position: -1,
        role: givenAuthUserSessionRole!
      };
      return message;
    },
    [id, storyIdNumber, givenAuthUserSessionRole, refetchRole]
  );

  const disconnectAndLeaveSession = useCallback(() => {
    if (stompClientRef.current && userDetails) {
      const leaveMessage: UserMessageDto = messageHandler(userDetails);
      stompClientRef.current.send(
        `/app/session/${id}/leave`,
        {},
        JSON.stringify(leaveMessage)
      );
      stompClientRef.current.disconnect();
      setIsConnected(false);
      stompClientRef.current = null;
    }
  }, [stompClientRef, userDetails, messageHandler, id]);

  useEffect(() => {
    if (session) {
      setSessionData(session);

      setCardsSelection(createCardsFromString(session.customValues));
    }
  }, [session]);

  useEffect(() => {
    if (storyList) {
      setStories(storyList);
    }
  }, [storyList]);

  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  const initializeSocketConnection = () => {
    const socket = () => new SockJS(serverUrl);
    const stompClient: CompatClient = Stomp.over(socket);
    stompClient.debug = () => {};
    const connectionTimeout: NodeJS.Timeout = setTimeout(() => {
      if (isConnecting) {
        setConnectionError(true);
        setIsConnecting(false);
      }
    }, 5000);

    stompClient.connect(
      {},
      () => {
        clearTimeout(connectionTimeout);
        setIsConnecting(false);
        setIsConnected(true);
        setConnectionError(false);

        stompClient.subscribe(
          `/topic/session/force-disconnect/${id}`,
          (message) => {
            const disconnectUserId = JSON.parse(message.body);
            if (disconnectUserId === authUserId) {
              disconnectAndLeaveSession();
              localStorage.setItem(
                LocalStorageProperties.userDisconnected,
                JSON.stringify({
                  sessionTitle: session?.title
                })
              );
              navigate(RoutePaths.USER_MANAGER_SESSIONS);
            }
          }
        );

        const latestStories = storiesRef.current;
        handleRefreshStories(latestStories);

        stompClient.subscribe(
          `/topic/session/${id}/receive-state`,
          (message) => {
            const sessionStatus = JSON.parse(message.body);
            setIsSessionActive(sessionStatus.sessionActive);
            setCurrentStory(sessionStatus.currentStory);
            setCurrentStoryIndex(sessionStatus.currentStoryIndex);
            setIsStoryInProgress(sessionStatus.storyInProgress);
            const latestStories = storiesRef.current;
            const currentTime: number = Math.floor(new Date().getTime() / 1000);
            const timerTime: number = currentTime - sessionStatus.startedTime;
            if (sessionStatus.sessionActive) {
              setHasRefreshed(true);
              setStartTime(timerTime);
            }
            let lengthFactor: number = 1;
            if (
              sessionStatus.sessionActive &&
              sessionStatus.currentStoryIndex !== 0
            )
              lengthFactor = 0;
            handlePercentChange(
              ((sessionStatus.currentStoryIndex + 1) / latestStories.length -
                lengthFactor) *
                100
            );
            if (!sessionStatus.storyInProgress && sessionStatus.sessionActive)
              flipAllCards();
          }
        );

        stompClient.subscribe(`/topic/session/${id}/users`, (message) => {
          const updatedUsers: UserMessageDto[] = JSON.parse(message.body);
          refetchRole();
          const updatedCards = updatedUsers
            .filter((user) => user.role !== UserSessionRole.OBSERVER)
            .map((user, index) => ({
              value: user.estimation,
              index: index + 1,
              isFlipped: user.userId === userDetails?.id,
              userFullName: user.userFullName,
              userId: user.userId,
              hasVoted: true
            }));
          setCards(updatedCards);
          setUsers(updatedUsers);
          setEsimationCards(updatedCards);
          if (
            updatedCards.every((card) => {
              return card.value !== "";
            })
          ) {
            if (!viewVotes) {
              setViewVotes(true);
            }

            handlePauseEstimation();
            flipAllCards();
          }
        });

        stompClient.subscribe(`/topic/session/${id}/flip-cards`, () => {
          if (isStoryInProgress) {
            handlePauseEstimation();
          }
          setCards((prevCards) =>
            prevCards.map((card) => ({
              ...card,
              isFlipped: true
            }))
          );
        });

        stompClient.subscribe(`/topic/session/${id}/revote-story`, () => {
          handleClearEstimation();
          clearVotes();
          setViewVotes(false);
          setIsStoryInProgress(true);
        });

        stompClient.subscribe(`/topic/session/${id}/start`, () => {
          const latestStories = storiesRef.current;

          if (latestStories && latestStories.length > 0) {
            setIsSessionActive(true);
            setIsStoryInProgress(true);
            setCurrentStoryIndex(0);
            setCurrentStory(latestStories.at(0) || null);
            handlePercentChange(0);
            setStartTime(0);
            openNotification(
              "info",
              "Session started",
              "Prepare your estimations for the current story, the session was started by your session manager.",
              "topRight",
              3
            );
          }
        });

        stompClient.subscribe(`/topic/session/${id}/end`, () => {
          setIsSessionActive(false);
          setIsStoryInProgress(false);
          setCurrentStory(null);
          handleClearEstimation();
          clearVotes();
          handlePercentChange(0);

          openNotification(
            "info",
            "Session ended",
            "The estimation session was ended, you may now check the team's statistics.",
            "topRight",
            3
          );
        });

        stompClient.subscribe(
            `/app/session/${id}/save-votes/${stories[currentStoryIndex].key}/${currentStoryAverage}`, () => {
                const latestStories = storiesRef.current;
                if (latestStories && latestStories.length > 0) {
                    const currentStory = latestStories[currentStoryIndex];
                    if (currentStory) {
                    setCurrentStoryAverage(currentStory.average || "N/A");
                    setCurrentStory(currentStory);
                    }
                }
            }
        );

        stompClient.subscribe(`/topic/session/${id}/next`, () => {
          setCurrentStoryIndex((prevIndex) => {
            const latestStories = storiesRef.current;
            if (latestStories && prevIndex < latestStories.length - 1) {
              const nextIndex = prevIndex + 1;
              setCurrentStory(latestStories.at(nextIndex) || null);
              handlePercentChange(
                (nextIndex / (latestStories.length - 1)) * 100
              );

              return nextIndex;
            } else {
              return prevIndex;
            }
          });
          setIsStoryInProgress(true);
          handleClearEstimation();
          clearVotes();
          setViewVotes(false);
        });

        stompClient.subscribe(`/topic/session/${id}/stories`, (message) => {
          const updatedStories = JSON.parse(message.body);
          setStories(updatedStories);
        });

        stompClient.send(`/app/session/${id}/get-state`);
        if (userDetails) {
          refetchRole();
          const joinMessage: UserMessageDto = messageHandler(userDetails);
          joinMessage.role = givenAuthUserSessionRole!;
          stompClient.send(
            `/app/session/${id}/join`,
            {},
            JSON.stringify(joinMessage)
          );
          refetchStories();
        }
      },
      (error: any) => {
        console.error("Error connecting to WebSocket:", error);
        setIsConnecting(false);
        setIsConnected(false);
        setConnectionError(true);
      }
    );

    stompClientRef.current = stompClient;
  };

  useEffect(() => {
    refetchStories();
    if (userDetails && sessionData) {
      if (!stompClientRef.current) {
        initializeSocketConnection();
      } else if (!stompClientRef.current.connected) {
        stompClientRef.current.connect();
      }
    }
  }, [id, userDetails, sessionData, serverUrl]);

  const handleOnConfirmLeaveSession = () => {
    disconnectAndLeaveSession();
    navigate(RoutePaths.USER_MANAGER_SESSIONS);
  };

  const handleStartSession = () => {
    stompClientRef.current?.send(`/app/session/${id}/start`);
  };

  const handleEndSession = () => {
    stompClientRef.current?.send(
      `/app/session/${id}/save-votes/${stories[currentStoryIndex].key}/${currentStoryAverage}`
    );
    stompClientRef.current?.send(`/app/session/${id}/end`);
  };

  const handleClearEstimation = () => {
    stompClientRef.current?.send(`/app/session/${id}/clear-estimation`);
  };

  const isValidAvarage = (avarage: any) =>
  typeof avarage === "string" ? avarage.trim() !== "" && avarage !== "N/A" : avarage != null;

  const handleNextStory = () => {
    const currentStory = stories[currentStoryIndex];
    if (!currentStory) return;

    const shouldSave = isValidAvarage(currentStoryAverage) && currentStory.average !== currentStoryAverage;

    if(shouldSave){
      setStories(prev => {
        const next = prev.map(s => s.key === currentStory.key ? { ...s, average: currentStoryAverage } : s);
        storiesRef.current = next;
        return next;
      });

      stompClientRef.current?.send(
          `/app/session/${id}/save-votes/${stories[currentStoryIndex].key}/${currentStoryAverage}`
      );
      //check if is working
      stompClientRef.current?.send(`/topic/session/${id}/stories`);
    }

    stompClientRef.current?.send(`/app/session/${id}/next`);
  };

  const handleRefreshStories = (updatedStories: StoryDto[]) => {
    stompClientRef.current?.send(
      `/app/session/${id}/update-stories`,
      {},
      JSON.stringify(updatedStories)
    );
  };

  const flipAllCards = () => {
    stompClientRef.current?.send(`/app/session/${id}/flip-cards`);
  };

  const flipAllCardsObserver = () => {
    setCards((prevCards) =>
      prevCards.map((card) => ({
        ...card,
        isFlipped: true
      }))
    );
  };

  const handleRevoteStory = () => {
    stompClientRef.current?.send(`/app/session/${id}/revote-story`);
  };

  const handleOnChangeRole = (userId: number, newRole: UserSessionRole) => {
    stompClientRef.current?.send(
      `/app/session/role/${id}/${newRole}`,
      {},
      JSON.stringify(userId)
    );
  };

  const handleCardSelect = (selectedCard: CardSelectionDto) => {
    setSelectedCard(selectedCard);
    stompClientRef.current?.send(
      `/app/session/${id}/estimated/${selectedCard.value}`,
      {},
      JSON.stringify(authUserId)
    );
  };

  const handlePauseEstimation = () => {
    setIsStoryInProgress(false);
  };

  const handleOnDeleteUser = (userId: number) => {
    stompClientRef.current?.send(
      `/app/session/force-disconnect/${id}`,
      {},
      JSON.stringify(userId)
    );
  };

  const createCardsFromString = (cardString: string): CardSelectionDto[] => {
    return cardString.split(";").map((value) => ({
      value: value.trim()
    }));
  };

  const clearVotes = () => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        return { ...card, value: "", hasVoted: false };
      })
    );
  };

  const showDrawerParticipants = () => {
    setOpenParticipants(true);
  };

  const showDrawerStories = () => {
    setOpenStories(true);
  };

  const handlePercentChange = (value: number) => {
    setEstimationProgressPercent(value);
  };

  const handleUpdateAverage = (value: string) => {
    setCurrentStoryAverage(value);
  };

  const toggleInviteUsersModal = () => {
    setInviteUsersModal(!inviteUsersModal);

    if (allUsers) {
      setUsersOptions(
        mapUsersToOptions(
          allUsers.filter(
            (user) => user.role !== UserRole.ADMIN && user.id !== authUserId
          )
        ) || []
      );
    }
  };

  const toggleAddFeedbackModal = () => {
    setIsOpenFeedback(!isOpenFeedback);
  };

  const toggleLeaveSessionModal = () => {
    setLeaveSessionModal(!leaveSessionModal);
  };

  const goToStatistics = () => {
    disconnectAndLeaveSession();
    navigate(RoutePaths.SESSION_ENDED.replace(":id", id || ""));
  };

  const handleSubmitCreateStory = async (newStory: CreateStoryDto) => {
    try {
      await createStory({ newStory })
        .unwrap()
        .then((payload: StoryDto) => {
          const updatedStories = [...stories, payload];
          handleRefreshStories(updatedStories);
          setStories(updatedStories);
        });
      openSuccessNotification(`Stories added.`);
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  const toggleOpen = () => {
    setOpen(true);
  };

  const toggleClose = () => {
    setOpen(false);
  };

  const handleStatusChangeStart = async () => {
    try {
      await updateSessionStatus({
        newStatus: SessionStatus.ACTIVE,
        sessionId: Number(id)
      })
        .unwrap()
        .then((payload: SessionDto) => {
          handleStartSession();
        });

      // Send the status change to the WebSocket server
      stompClientRef.current?.send(`/app/session/${id}/status-change`, {}, JSON.stringify({ status: SessionStatus.ACTIVE, sessionId: id }));

    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  const handleStatusChangeEnd = async () => {
    try {
      await updateSessionStatus({
        newStatus: SessionStatus.ENDED,
        sessionId: Number(id)
      })
        .unwrap()
        .then((payload: SessionDto) => {
          handleEndSession();
        });

      // Send the status change to the WebSocket server
      stompClientRef.current?.send(`/app/session/${id}/status-change`, {}, JSON.stringify({ status: SessionStatus.ENDED, sessionId: id }));

    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  const toggleCardFlip = (index: number) => {
    if (authUserSessionRole === UserSessionRole.OBSERVER) {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.index === index ? { ...card, isFlipped: !card.isFlipped } : card
        )
      );
    }
  };

  const handleSessionRoleChange = async (
    userId: number,
    newRole: UserSessionRole
  ) => {
    try {
      await updateUserSessionRole({
        newRole: newRole,
        userId: userId,
        sessionId: Number(id)
      })
        .unwrap()
        .then((payload: UserSessionDetailsDto) => {
          handleOnChangeRole(userId, newRole);
        });
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
      <SessionRouteGuard sessionId={Number(id)} userId={authUserId}>
        {authUserSessionRole === UserSessionRole.MANAGER && (
          <FloatButton
            tooltip="Functionalities tour"
            type="primary"
            onClick={toggleOpen}
            className="float-button primary-button"
            icon={<QuestionOutlined />}
          />
        )}
        <div className="main-game-container">
          <div className="session-dashboard-container">
            <SessionControlDashboard
              isSessionActive={isSessionActive}
              isStoryInProgress={isStoryInProgress}
              currentStory={currentStory}
              currentStoryIndex={currentStoryIndex}
              storyList={stories ? stories : []}
              isConnected={isConnected}
              managerId={session ? session.sessionManagerId : 0}
              estimationProgressPercent={estimationProgressPercent}
              cards={estimationCards}
              cardValues={cardsSelection}
              valueType={session ? session.valueType : ""}
              authSessionRole={authUserSessionRole}
              onStartSession={handleStatusChangeStart}
              onEndSession={handleStatusChangeEnd}
              onNextStory={handleNextStory}
              handleUpdateAverage={handleUpdateAverage}
              showDrawerParticipants={showDrawerParticipants}
              showDrawerStories={showDrawerStories}
              toggleLeaveSessionModal={toggleLeaveSessionModal}
              toggleAddFeedbackModal={toggleAddFeedbackModal}
              flipAllCards={flipAllCardsObserver}
              onPauseStory={handlePauseEstimation}
              onToggleClose={toggleClose}
              toggleOpenTour={open}
              goToStatistics={goToStatistics}
            />
          </div>
          <div className="game-table-container">
              {sessionData ? (
                <>
                  <div className="title-timer">
                    <h3>{sessionData.title}</h3>
                    <Title className="title-main-page-timer" level={5}>
                      <SessionTimer
                        startTime={startTime}
                        hasRefreshed={hasRefreshed}
                        isSessionActive={isSessionActive}
                      />
                    </Title>
                  </div>
                </>
              ) : (
                <div>No session found</div>
              )}

              {inviteUsersModal && (
                <InviteUsersModal
                  onClose={toggleInviteUsersModal}
                  users={usersOptions}
                  session={session ? session : undefined}
                />
              )}

              {leaveSessionModal && (
                <LeaveSessionModal
                  onClose={toggleLeaveSessionModal}
                  onOk={handleOnConfirmLeaveSession}
                />
              )}

              {isOpenFeedback && (
                <AddFeedbackModal
                  onClose={toggleAddFeedbackModal}
                  userId={authUserId}
                  sessionId={Number(id)}
                />
              )}

              <PokerTable cards={cards} toggleCardFlip={toggleCardFlip} currentStory={currentStory} onRevoteStory={handleRevoteStory}/>

              {isSessionActive &&
                isStoryInProgress &&
                authUserSessionRole !== UserSessionRole.OBSERVER && (
                  <FooterCardSelection
                    cards={cardsSelection}
                    onCardSelect={handleCardSelect}
                  />
                )}
          </div>
          <div className="session-lists-container">
            <SessionListsCard
                users={users}
                loggedUserId={authUserId}
                sessionManagerId={session ? session.sessionManagerId : 0}
                storyList={stories ? stories : []}
                isLoading={isLoading}
                isSessionActive={isSessionActive}
                sessionId={Number(id)}
                userRole={authUserRole}
                createStory={handleSubmitCreateStory}
                onDeleteUser={handleOnDeleteUser}
                onRoleChange={handleSessionRoleChange}
                toggleInviteUsersModal={toggleInviteUsersModal}
                isConnected={isConnected}
            />
          </div>

          <div className="connection-status">
            {isConnecting ? (
              <>
                <Flex gap="small" vertical>
                  <Spin size="large" />
                  <Alert
                    message="Wait a moment..."
                    description="Your connection is being established, please give it a moment."
                    type="info"
                  />
                </Flex>
              </>
            ) : connectionError ? (
              <Alert
                message="Whoops, connection error..."
                description="You have been disconnected from the server, please try to access the session again."
                type="error"
              />
            ) : null}
          </div>
        </div>
      </SessionRouteGuard>
    </>
  );
}
