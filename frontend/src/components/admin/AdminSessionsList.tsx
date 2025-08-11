import {useState} from "react";
import {useSaveSessionMutation} from "../../api/SessionApi";
import {Button, Card} from "antd";
import "../../styles/User.css";
import {AppstoreAddOutlined} from "@ant-design/icons";
import {SessionDto} from "../../utils/dtos/SessionDto";
import {useLocation} from "react-router-dom";
import CustomDashboard from "../user/CustomDashboard";
import {useAssignManagerToSessionMutation, useGetUserProfileQuery} from "../../api/UserApi";
import {getAuthenticatedUserClaim} from "../../services/AuthService";
import {LocalStorageProperties} from "../../utils/Enums";
import CreateSessionModal from "../session/CreateSessionModal";
import useNotifier from "../hooks/useNotifier";
import SessionTable from "./SessionTable";

export default function AdminSessionList() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const [createSessionModal, setCreateSessionModal] = useState<boolean>(false);
  const { openSuccessNotification, openErrorNotification, contextHolder } =
    useNotifier();

  const { data: userDetails } = useGetUserProfileQuery({
    userId: Number(getAuthenticatedUserClaim(LocalStorageProperties.id))
  });
  const [saveSession] = useSaveSessionMutation();
  const [assignManager] = useAssignManagerToSessionMutation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleAddSessionModal = () => {
    setCreateSessionModal(!createSessionModal);
  };

  const handleSubmitCreateSession = async (session: SessionDto) => {
    try {
      await saveSession({ newSession: session })
        .unwrap()
        .then((payload: SessionDto) => {
          assignManager({ request: payload });
        });
      openSuccessNotification(
        `The session ${session.title} has been added. You may now join it anytime.`
      );
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="session-container">
        <CustomDashboard
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          currentPath={currentPath}
        />
        <Card className={`user-card  ${isOpen ? "shifted" : ""}`}>
          <div className="card-header">
            <Button
              className="primary-button"
              type="primary"
              icon={<AppstoreAddOutlined />}
              onClick={toggleAddSessionModal}
            >
              Create session
            </Button>
          </div>
          <div className="card-content">
            <SessionTable isOpen={isOpen}/>
            {createSessionModal && userDetails && (
              <CreateSessionModal
                onOk={handleSubmitCreateSession}
                creatorId={Number(userDetails.id)}
                onClose={() => setCreateSessionModal(false)}
                userDetails={userDetails}
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
