import {
  Alert,
  Button,
  Card,
  Flex,
  Progress,
  Result,
  Spin,
  Tooltip,
  Tour,
  Typography
} from "antd";
import { StoryDto } from "../../utils/dtos/StoryDto";
import { LoadingOutlined } from "@ant-design/icons";
import { getAuthenticatedUserClaim } from "../../services/AuthService";
import {
  LocalStorageProperties, SessionDashboard, SessionDetails,
  UserRole,
  UserSessionRole
} from "../../utils/Enums";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  RetweetOutlined,
  PlayCircleOutlined,
  StopOutlined,
  RightOutlined,
  PieChartOutlined,
  SettingOutlined,
  FieldTimeOutlined,
  FormOutlined,
  ApiOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { ProgressProps } from "antd/lib";
import Title from "antd/es/typography/Title";
import { CardDto } from "../../utils/dtos/CardDto";
import { Pie } from "@ant-design/charts";
import { CardSelectionDto } from "../../utils/dtos/CardSelectionDto";

interface ISessionDashboardProps {
  isSessionActive: boolean;
  isStoryInProgress: boolean;
  currentStory: StoryDto | null;
  currentStoryIndex: number;
  storyList: StoryDto[];
  cards: CardDto[];
  cardValues: CardSelectionDto[];
  valueType: string;
  isConnected: boolean;
  managerId: number;
  estimationProgressPercent: number;
  toggleOpenTour: boolean;
  authSessionRole: string;
  onStartSession: () => void;
  onEndSession: () => void;
  onNextStory: () => void;
  handleUpdateAverage: (avg: string) => void;
  showDrawerParticipants: () => void;
  showDrawerStories: () => void;
  toggleLeaveSessionModal: () => void;
  toggleAddFeedbackModal: () => void;
  flipAllCards: () => void;
  onPauseStory: () => void;
  onToggleClose: () => void;
  goToStatistics: () => void;
}

interface ISessionControlProps {
  isSessionActive: boolean;
  currentStory: StoryDto | null;
  currentStoryIndex: number;
  storyList: StoryDto[];
  isConnected: boolean;
  managerId: number;
  estimationProgressPercent: number;
  toggleOpenTour: boolean;
  authSessionRole: string;
  onStartSession: () => void;
  onEndSession: () => void;
  onNextStory: () => void;
  showDrawerParticipants: () => void;
  showDrawerStories: () => void;
  toggleLeaveSessionModal: () => void;
  toggleAddFeedbackModal: () => void;
  flipAllCards: () => void;
  onPauseStory: () => void;
  onToggleClose: () => void;
  goToStatistics: () => void;
}

interface ISessionStatisticsProps {
  isSessionActive: boolean;
  isStoryInProgress: boolean;
  cards: CardDto[];
  cardValues: CardSelectionDto[];
  valueType: string;
  handleUpdateAverage: (avg: string) => void;
}

const voteTypes: Record<string, number> = {
  "½": 0.5,
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
  XXL: 13
};

const specialVotes: string[] = ["?", "Coffee"];

const EstimationControlsContent = (props: ISessionControlProps) => {
  const {
    isSessionActive,
    currentStoryIndex,
    storyList,
    isConnected,
    managerId,
    estimationProgressPercent,
    toggleOpenTour,
    authSessionRole,
    onStartSession,
    onEndSession,
    onNextStory,
    toggleLeaveSessionModal,
    toggleAddFeedbackModal,
    flipAllCards,
    onPauseStory,
    onToggleClose,
    goToStatistics
  } = props;

  const authUserRole = getAuthenticatedUserClaim(LocalStorageProperties.role);
  const authUserId = Number(
    getAuthenticatedUserClaim(LocalStorageProperties.id)
  );
  const progressBarColor: ProgressProps["strokeColor"] = {
    "0%": "#5c859e",
    "100%": "#8a9e77"
  };

  const refStartSession = useRef(null);
  const refEndSession = useRef(null);
  const refNextStory = useRef(null);
  const refStopEstimation = useRef(null);
  const refInviteUsers = useRef(null);
  const refAddFeedback = useRef(null);
  const refSeeStatistics = useRef(null);
  const refRevoteStory = useRef(null);

  const steps = [
    {
      title: "Start Session",
      description: "Start the estimation session.",
      target: () => refStartSession.current
    },
    {
      title: "End Session",
      description: "End the estimation session.",
      target: () => refEndSession.current
    },
    {
      title: "Next Story",
      description: "Move to the next story for estimation.",
      target: () => refNextStory.current
    },
    {
      title: "Stop Estimation",
      description: "Reveal all cards and stop the estimation.",
      target: () => refStopEstimation.current
    },
    {
      title: "See Statistics",
      description:
        "See the statistics of this session, after the session has ended!",
      target: () => refSeeStatistics.current
    },
    {
      title: "Add Feedback",
      description: "Tell us what you think about this session!",
      target: () => refAddFeedback.current
    },
    {
      title: "Revote Story",
      description: "Revote on the current story.",
      target: () => refRevoteStory.current
    }
  ];

  return (
    <>
      <Flex gap="small" vertical className="story-progress-container">
        <Progress
          className="progress-bar"
          status="active"
          strokeColor={progressBarColor}
          percent={estimationProgressPercent}
          format={() => null}
        />
      </Flex>

      <div className="session-button-group">
        <Button
          className="manager-button"
          ref={refAddFeedback}
          icon={<FormOutlined />}
          onClick={toggleAddFeedbackModal}
          disabled={!isSessionActive}
        >
          {SessionDashboard.ADD_FEEDBACK}
        </Button>
        <br />
      </div>

      {authUserRole === UserRole.MANAGER && authUserId === managerId && (
        <>
          <div className="manager-actions-container">
            <Card
              loading={!isConnected}
              className="manager-actions-button-group"
              title={SessionDashboard.SESSION_ACTIONS}
            >
              <Button
                ref={refStartSession}
                className="manager-button"
                onClick={onStartSession}
                loading={!isConnected}
                disabled={isSessionActive}
                icon={<PlayCircleOutlined />}
              >
                {SessionDashboard.START_SESSION}
              </Button>

              <Tooltip title="Reveal all cards">
                <Button
                    ref={refStopEstimation}
                    className="manager-button"
                    icon={<FieldTimeOutlined />}
                    onClick={() => {
                      flipAllCards();
                      onPauseStory();
                    }}
                >
                  {SessionDashboard.STOP_ESTIMATION}
                </Button>
              </Tooltip>

              <Button
                ref={refNextStory}
                icon={<RightOutlined />}
                className="manager-button"
                onClick={onNextStory}
                loading={!isConnected}
                disabled={
                  !isSessionActive || currentStoryIndex === storyList.length - 1
                }
              >
                {SessionDashboard.NEXT_STORY}
              </Button>

              <Button
                  ref={refEndSession}
                  danger
                  icon={<StopOutlined />}
                  className="manager-button"
                  onClick={onEndSession}
                  loading={!isConnected}
                  disabled={!isSessionActive}
              >
                {SessionDashboard.FINISH_SESSION}
              </Button>

            </Card>

            <Tour open={toggleOpenTour} onClose={onToggleClose} steps={steps} />
          </div>
        </>
      )}

      {authSessionRole === UserSessionRole.OBSERVER && (
        <Button icon={<RetweetOutlined />} onClick={flipAllCards}>
          {SessionDashboard.FLIP_CARDS}
        </Button>
      )}

      <div className="leave-session-button">
        <br />
        <Button
          className="session-button"
          ref={refSeeStatistics}
          icon={<BarChartOutlined />}
          onClick={goToStatistics}
          disabled={isSessionActive}
        >
          {SessionDashboard.SHOW_STATISTICS}
        </Button>

        <div>
          <Button
            className="manager-button red-background-button"
            danger
            icon={<ApiOutlined />}
            onClick={toggleLeaveSessionModal}
          >
            {SessionDashboard.LEAVE_SESSION}
          </Button>
        </div>
      </div>
    </>
  );
};

const EstimationStatisticsContent = (props: ISessionStatisticsProps) => {
  const {
    cards,
    isSessionActive,
    isStoryInProgress,
    cardValues,
    handleUpdateAverage
  } = props;

  const valueSelection = cardValues.map(
    (cardSelection: CardSelectionDto) => cardSelection.value
  );

  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    const voteValues = cards
      .map((card: CardDto) => card.value)
      .map((value: string) => {
        if (value === "") {
          return "?";
        }

        return value;
      });
    voteValues.forEach((vote) => {
      counts[vote] = (counts[vote] || 0) + 1;
    });

    return counts;
  }, [cards]);

  const numericVotes = useMemo(() => {
    return Object.entries(voteCounts)
      .filter(([vote]) => !specialVotes.includes(vote))
      .flatMap(([vote, count]) => {
        const numericVote = voteTypes[vote] || parseFloat(vote);
        if (!isNaN(numericVote)) {
          return Array(count).fill(numericVote);
        }
        return [];
      });
  }, [voteCounts]);

  const computeAverage: number = useMemo(() => {
    if (numericVotes.length === 0) return 0;

    const total = numericVotes.reduce((acc, vote) => acc + vote, 0);
    return total / numericVotes.length;
  }, [numericVotes]);

  const findClosestVote = (average: number, cardValues: string[]): string => {
    if (average === 0) {
      return "N/A";
    }
    let closestValue = cardValues[0];
    let minDifference = Math.abs(
      average - (voteTypes[closestValue] || parseFloat(closestValue))
    );

    cardValues.forEach((value) => {
      const numericValue = voteTypes[value] || parseFloat(value);
      const difference = Math.abs(average - numericValue);

      if (difference < minDifference) {
        closestValue = value;
        minDifference = difference;
      }
    });

    return closestValue;
  };

  const closestAverage = findClosestVote(computeAverage, valueSelection);

  useEffect(() => {
    if (closestAverage) {
      handleUpdateAverage(closestAverage);
    }
  }, [closestAverage, handleUpdateAverage]);

  const pieData = useMemo(() => {
    return Object.entries(voteCounts).map(([voteType, count]) => ({
      type: voteType,
      value: count
    }));
  }, [voteCounts]);

  const chartConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#108ee9", "#87d068"],
    innerRadius: 0.6,
    label: {
      text: "type",
      style: {
        fontWeight: "bold"
      }
    },
    animation: false,
    annotations: [
      {
        type: "text",
        style: {
          text: `Average: ${closestAverage}`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 20,
          fontStyle: "bold"
        }
      }
    ]
  };

  return !isSessionActive || (isSessionActive && isStoryInProgress) ? (
    <Result
      icon={
        <span>
          {" "}
          <Spin indicator={<LoadingOutlined spin />} size="large" />{" "}
        </span>
      }
      title={
        <Typography.Title level={3} style={{color: "#395a6d"}}>
          Waiting for a story estimation to be completed...
        </Typography.Title>
      }
    />
  ) : (
    <>
      <Tooltip
        className="vote-distribution-tooltip"
        title="Average is approximated to the nearest value used in the estimation value selection for the given session."
      >
        <Title level={4}>Vote Distribution</Title>
      </Tooltip>
      <Pie {...chartConfig} />
    </>
  );
};

export default function SessionControlDashboard(props: ISessionDashboardProps) {
  const {
    isSessionActive,
    isStoryInProgress,
    currentStory,
    currentStoryIndex,
    storyList,
    cards,
    cardValues,
    valueType,
    isConnected,
    managerId,
    estimationProgressPercent,
    toggleOpenTour,
    authSessionRole,
    onStartSession,
    onEndSession,
    onNextStory,
    showDrawerParticipants,
    showDrawerStories,
    handleUpdateAverage,
    toggleLeaveSessionModal,
    toggleAddFeedbackModal,
    flipAllCards,
    onPauseStory,
    onToggleClose,
    goToStatistics
  } = props;

  const [activeTabKey, setActiveTabKey] =
    useState<string>("estimationControls");

  const tabList = [
    {
      key: "estimationControls",
      tab: (
        <span className="tab-label" style={{color: "white"}}>
          <SettingOutlined className="tab-icon" style={{color: "white"}}/>
          <span className="tab-text" style={{color: "white"}}>Controls</span>
        </span>
      )
    },
    {
      key: "estimationStatistics",
      tab: (
        <span className="tab-label" style={{color: "white"}}>
          <PieChartOutlined className="tab-icon" style={{color: "white"}} />
          <span className="tab-text" style={{color: "white"}}>Statistics</span>
        </span>
      )
    }
  ];

  const contentList: Record<string, React.ReactNode> = {
    estimationControls: (
      <EstimationControlsContent
        isSessionActive={isSessionActive}
        currentStory={currentStory}
        currentStoryIndex={currentStoryIndex}
        storyList={storyList}
        isConnected={isConnected}
        managerId={managerId}
        estimationProgressPercent={estimationProgressPercent}
        onStartSession={onStartSession}
        onEndSession={onEndSession}
        onNextStory={onNextStory}
        toggleOpenTour={toggleOpenTour}
        showDrawerParticipants={showDrawerParticipants}
        showDrawerStories={showDrawerStories}
        toggleLeaveSessionModal={toggleLeaveSessionModal}
        toggleAddFeedbackModal={toggleAddFeedbackModal}
        flipAllCards={flipAllCards}
        onPauseStory={onPauseStory}
        onToggleClose={onToggleClose}
        goToStatistics={goToStatistics}
        authSessionRole={authSessionRole}
      />
    ),
    estimationStatistics: (
      <EstimationStatisticsContent
        cards={cards}
        cardValues={cardValues}
        valueType={valueType}
        isStoryInProgress={isStoryInProgress}
        isSessionActive={isSessionActive}
        handleUpdateAverage={handleUpdateAverage}
      />
    )
  };

  const onTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  useEffect(() => {
    if (!isStoryInProgress && isSessionActive) {
      setActiveTabKey("estimationStatistics");
    } else if (isStoryInProgress && isSessionActive) {
      setActiveTabKey("estimationControls");
    }
  }, [isStoryInProgress, isSessionActive]);

  return (
    <div style={{display: "flex"}}>
      <Card
        className="session-dashboard-content"
        title={
          <>
            <div style={{color: "#395a6d"}}>Session Dashboard</div>
            <br />
          </>
        }
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
      >
        {contentList[activeTabKey]}
      </Card>
    </div>
  );
}
