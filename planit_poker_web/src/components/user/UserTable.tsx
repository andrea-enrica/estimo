import { useState } from "react";
import GenericPaginatedTable from "../GenericTable";
import { PaginatedResponseDto } from "../../utils/dtos/PaginatedResponseDto";
import { UserDto, UserRole } from "../../utils/dtos/UserDto";
import { Button, Flex, TableProps, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import "../../styles/User.css";
import DeleteUserModal from "./DeleteUserModal";
import {
  useDeleteUserMutation,
  useLazyGetUsersPagedQuery,
  useUpdateUserMutation
} from "../../api/AdminApi";
import useNotifier from "../hooks/useNotifier";
import { getAuthenticatedUserClaim } from "../../services/AuthService";
import { LocalStorageProperties, UserModalEnum } from "../../utils/Enums";
import UserModal from "./UserModal";

const UsersTable = () => {
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentSelectedUser, setCurrentSelectedUser] = useState<UserDto>();
  const { openSuccessNotification, openErrorNotification, contextHolder } =
    useNotifier();

  const [getPagedUsers, { data, isLoading, isFetching }] =
    useLazyGetUsersPagedQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const userId = Number(getAuthenticatedUserClaim(LocalStorageProperties.id));

  const columns: TableProps<UserDto>["columns"] = [
    {
      title: "User ID",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "User Name",
      dataIndex: "username",
      key: "username"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName"
    },
    {
      title: "Phone number",
      dataIndex: "phoneNumber",
      key: "phoneNumber"
    },
    {
      title: "Role",
      key: "role",
      dataIndex: "role",
      render: (text, record) => (
        <Tag
          color={
            text === UserRole.ADMIN
              ? "#d94e4e"
              : text === UserRole.MANAGER
              ? "#d9822b"
              : "#5c859e"
          }
        >
          {text}
        </Tag>
      )
    },
    {
      title: "Action",
      key: "action",
      render: (record: UserDto) => {
        return (
          <>
            <Flex gap="small" align="center" wrap>
              <Button
                icon={<EditOutlined />}
                className="primary-button"
                type="primary"
                shape="circle"
                onClick={() => {
                  setShowUpdateModal(true);
                  setCurrentSelectedUser(record);
                }}
              ></Button>

              {record.id !== userId && (
                <Button
                  icon={<DeleteOutlined />}
                  className="delete-button"
                  type="primary"
                  shape="circle"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setCurrentSelectedUser(record);
                  }}
                ></Button>
              )}
            </Flex>
          </>
        );
      }
    }
  ];

  const handleSubmitUpdateUser = async (newUser: UserDto) => {
    try {
      await updateUser({
        userId: newUser.id,
        newUser: newUser
      }).unwrap();
      openSuccessNotification(
        `The selected user details have been changed successfully.`
      );
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        "An unexpected error occurred. Please try again.";
      openErrorNotification(errorMessage);
    }
  };

  const handleSubmitDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      openSuccessNotification(
        `The selected user has been permanently deleted.`
      );
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="users-table-container">
        <GenericPaginatedTable<UserDto>
          getPagedData={getPagedUsers}
          columns={columns}
          data={data ? data : ({} as PaginatedResponseDto<UserDto>)}
          isLoading={isLoading}
          isFetching={isFetching}
        />
        {showUpdateModal && currentSelectedUser && (
          <UserModal
            currentSelectedUser={currentSelectedUser}
            onOk={handleSubmitUpdateUser}
            onClose={() => setShowUpdateModal(false)}
            type={UserModalEnum.edit}
          />
        )}
        {showDeleteModal && currentSelectedUser && (
          <DeleteUserModal
            currentSelectedUserId={currentSelectedUser.id}
            currentSelectedUserFullName={currentSelectedUser.fullName}
            onOk={handleSubmitDeleteUser}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default UsersTable;
