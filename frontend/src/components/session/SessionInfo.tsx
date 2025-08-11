import {Button, Card, Flex} from "antd";
import {SessionDto} from "../../utils/dtos/SessionDto";
import "../../styles/Session.css";
import manager from "../../images/manager.png";
import participated from "../../images/participated.jpg";
import {useNavigate} from "react-router-dom";
import {FilterSessionsEnum, SessionStatus} from "../../utils/Enums";
import {
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useUpdateSessionDetailsMutation
} from "../../api/SessionApi";
import {useState} from "react";
import {EditOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import UpdateSessionModal from "./UpdateSessionModal";
import useNotifier from "../hooks/useNotifier";

interface IOwnProps {
  session: SessionDto;
  userId: number;
  filter: string;
}

export default function SessionInfo(props: IOwnProps) {
  let { session, userId, filter } = props;
  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [currentSelectedSession, setCurrentSelectedSession] =
    useState<SessionDto>();
  const [updateSession] = useUpdateSessionDetailsMutation();
  const navigate = useNavigate();
  const { openSuccessNotification, openErrorNotification } = useNotifier();

  const handleCardClick = () => {
    navigate(`/session-overview/session/${session.id}`);
  };

  const handleAcceptInvite = () => {
    const sessionId = session.id;
    acceptInvite({ userId, sessionId });
  };

  const handleDeclineInvite = () => {
    const sessionId = session.id;
    declineInvite({ userId, sessionId });
  };

  const handleSubmitUpdateSession = async (
    sessionId: number,
    title: string,
    customValues: string
  ) => {
    try {
      await updateSession({
        sessionId,
        title,
        customValues,
      }).unwrap(); // Unwrap to get updated session data

      openSuccessNotification(
        `The session ${title} has been updated. You can now manage it and join it anytime.`
      );
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  return (
    <>
      <div className="session-card-container">
        <Card
          hoverable
          cover={
            <img
              src={
                filter === FilterSessionsEnum.MANAGED ? manager : participated
              }
              height={200}
              alt="Session"
            />
          }
          key={session.id}
          className={"sessionCard"}
          onClick={
            filter === FilterSessionsEnum.INVITED ? () => {} : handleCardClick
          }
        >
          <h3 style={{color: "#395a6d", fontWeight: "bold"}}>{session.title}</h3>
          <p>{`Status: ${session.status} `}</p>
          <p>{`Date Created: ${session.dateCreated} `}</p>
          <p>{`Date Ended: ${
            session.dateEnded ? session.dateEnded : "Not ended yet"
          }`}</p>
        </Card>

        {filter === FilterSessionsEnum.INVITED && (
          <div className="card-buttons">
            <Flex gap="large" align="center" justify="center" wrap>
              <Button
                icon={<PlusOutlined />}
                onClick={handleAcceptInvite}
                type="primary"
                className="primary-button"
                size="large"
              >
                Accept
              </Button>
              <Button
                icon={<MinusOutlined />}
                onClick={handleDeclineInvite}
                type="primary"
                className="delete-button"
                size="large"
              >
                Decline
              </Button>
            </Flex>
          </div>
        )}

        {filter === FilterSessionsEnum.MANAGED && (
          <>
            {session.status === SessionStatus.IDLE && (<Button
              className="card-button primary-button"
              icon={<EditOutlined />}
              onClick={() => {
                setShowUpdateModal(true);
                setCurrentSelectedSession(session);
              }}
              type="primary"
              size="large"
            />)}
            {showUpdateModal && currentSelectedSession && (
              <UpdateSessionModal
                onUpdateOk={handleSubmitUpdateSession}
                currentSelectedSession={currentSelectedSession}
                onClose={() => setShowUpdateModal(false)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
