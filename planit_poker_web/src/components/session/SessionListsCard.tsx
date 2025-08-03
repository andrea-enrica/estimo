import {Card, Tour} from "antd";
import { StoryDto } from "../../utils/dtos/StoryDto";
import { UserSessionRole } from "../../utils/Enums";
import { useState } from "react";
import { InboxOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { UserMessageDto } from "../../utils/dtos/UserMessageDto";
import { CreateStoryDto } from "../../utils/dtos/CreateStoryDto";
import StoryTable from "../story/StoryTable";
import UserList from "../user/UserList";

interface ISessionControlProps {
  users: UserMessageDto[];
  loggedUserId: number;
  sessionManagerId: number;
  storyList: StoryDto[];
  isLoading: boolean;
  isSessionActive: boolean;
  sessionId: number;
  userRole: string | undefined;
  onDeleteUser: (userId: number) => void;
  onRoleChange: (userId: number, newRole: UserSessionRole) => void;
  createStory: (story: CreateStoryDto) => void;
  toggleInviteUsersModal: () => void;
  isConnected: boolean;
}

export default function SessionControlDashboard(props: ISessionControlProps) {
  const {
    users,
    loggedUserId,
    sessionManagerId,
    storyList,
    isLoading,
    isSessionActive,
    sessionId,
    userRole,
    onDeleteUser,
    onRoleChange,
    createStory,
    toggleInviteUsersModal,
    isConnected,
  } = props;

  const [activeTabKey, setActiveTabKey] = useState<string>("usersControl");

  const tabList = [
    {
      key: "usersControl",
      tab: (
        <span className="tab-label" style={{color: "white"}}>
          <UsergroupAddOutlined className="tab-icon" style={{color: "white"}} />
          <span className="tab-text" style={{color: "white"}}>Users</span>
        </span>
      )
    },
    {
      key: "storiesControl",
      tab: (
        <span className="tab-label" style={{color: "white"}}>
          <InboxOutlined className="tab-icon" style={{color: "white"}}/>
          <span className="tab-text" style={{color: "white"}}>Stories</span>
        </span>
      )
    }
  ];

  const contentList: Record<string, React.ReactNode> = {
    usersControl: (
      <UserList
        users={users}
        loggedUserId={loggedUserId}
        sessionManagerId={sessionManagerId}
        userRole={userRole}
        onDeleteUser={onDeleteUser}
        onRoleChange={onRoleChange}
        toggleInviteUsersModal={toggleInviteUsersModal}
        isConnected={isConnected}
      />
    ),
    storiesControl: (
      <StoryTable
        storyList={storyList}
        isLoading={isLoading}
        isSessionActive={isSessionActive}
        sessionId={sessionId}
        sessionManagerId={sessionManagerId}
        userRole={userRole}
        createStory={createStory}
      />
    )
  };

  const onTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <Card
      className="session-dashboard-content"
      title="Session Details"
      tabList={tabList}
      activeTabKey={activeTabKey}
      onTabChange={onTabChange}
    >
      {contentList[activeTabKey]}
    </Card>
  );
}
