import {Button, Dropdown, Flex, List, MenuProps, Tag} from "antd";
import "../../styles/UserList.css";
import {UserMessageDto} from "../../utils/dtos/UserMessageDto";
import {EditOutlined, EyeOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined} from "@ant-design/icons";
import {useRef, useState} from "react";
import DeleteUserModal from "./DeleteUserModal";
import useNotifier from "../hooks/useNotifier";
import {LocalStorageProperties, SessionDashboard, UserRole, UserSessionRole} from "../../utils/Enums";
import {getAuthenticatedUserClaim} from "../../services/AuthService";

interface IUserListProps {
  users: UserMessageDto[];
  loggedUserId: number;
  sessionManagerId: number;
  onDeleteUser: (userId: number) => void;
  onRoleChange: (userId: number, newRole: UserSessionRole) => void;
  toggleInviteUsersModal: () => void
  isConnected: boolean;
  userRole: string | undefined;
}

const UserList: React.FC<IUserListProps> = (props: IUserListProps) => {
  const { users, loggedUserId, onDeleteUser, onRoleChange, sessionManagerId, toggleInviteUsersModal, isConnected, userRole } =
    props;
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentSelectedUser, setCurrentSelectedUser] =
    useState<UserMessageDto>();
  const { openSuccessNotification, openErrorNotification, contextHolder } =
    useNotifier();
  const refInviteUsers = useRef(null);
  const authUserId = Number(
      getAuthenticatedUserClaim(LocalStorageProperties.id)
  );

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const newRole =
      e.key === "USER" ? UserSessionRole.USER : UserSessionRole.OBSERVER;
    if (currentSelectedUser) {
      onRoleChange(currentSelectedUser.userId, newRole);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: "User",
      key: UserSessionRole.USER,
      icon: <UserOutlined />
    },
    {
      label: "Observer",
      key: UserSessionRole.OBSERVER,
      icon: <EyeOutlined />
    }
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick
  };

  const handleSubmitDeleteUser = async (userId: number) => {
    try {
      onDeleteUser(userId);
      openSuccessNotification(
        `The selected user has been removed from the session.`
      );
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  const getTagColor = (role: UserSessionRole) => {
    switch (role) {
      case UserSessionRole.USER:
        return "#5c859e";
      case UserSessionRole.OBSERVER:
        return "#8a9e77";
      case UserSessionRole.MANAGER:
        return "#d9822b";
      default:
        return "#5c859e";
    }
  };

  return (
    <div className="story-table-header">
      {contextHolder}
      {UserRole.MANAGER === userRole && authUserId === sessionManagerId && (
        <Button
        className="add-story-button primary-button"
        type="primary"
        ref={refInviteUsers}
        icon={<UserAddOutlined />}
        onClick={toggleInviteUsersModal}
        disabled={!isConnected}
    >
      {SessionDashboard.INVITE_USERS}
        </Button>
      )}
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                title={item.userFullName}
                description={
                  <Tag color={getTagColor(item.role)}>{item.role}</Tag>
                }
              />

              <Flex gap="small" align="center" wrap>
                {sessionManagerId === loggedUserId &&
                  item.userId !== loggedUserId && (
                    <Dropdown
                      menu={menuProps}
                      onOpenChange={() => setCurrentSelectedUser(item)}
                    >
                      <Button className="primary-button" type="primary" icon={<EditOutlined />}></Button>
                    </Dropdown>
                  )}
                {sessionManagerId === loggedUserId &&
                  item.userId !== loggedUserId && (
                    <Button
                      type="primary"
                      className="delete-button"
                      icon={<UserDeleteOutlined />}
                      onClick={() => {
                        setShowDeleteModal(true);
                        setCurrentSelectedUser(item);
                      }}
                    ></Button>
                  )}
              </Flex>
              {showDeleteModal && currentSelectedUser && (
                <DeleteUserModal
                  currentSelectedUserId={currentSelectedUser.userId}
                  currentSelectedUserFullName={currentSelectedUser.userFullName}
                  onClose={() => {
                    setShowDeleteModal(false);
                  }}
                  onOk={handleSubmitDeleteUser}
                />
              )}
            </List.Item>
          )}
        />
    </div>
  );
};

export default UserList;
