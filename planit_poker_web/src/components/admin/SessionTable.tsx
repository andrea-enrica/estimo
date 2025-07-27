import { Button, Flex, TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { useState } from "react";
import "../../styles/User.css";
import { SessionDto } from "../../utils/dtos/SessionDto";
import { useNavigate } from "react-router-dom";
import GenericPaginatedTable from "../GenericTable";
import {
  useDeleteSessionMutation,
  useLazyGetSessionsPagedQuery,
  useUpdateSessionDetailsMutation
} from "../../api/SessionApi";
import { PaginatedResponseDto } from "../../utils/dtos/PaginatedResponseDto";
import DeleteSessionModal from "./DeleteSessionModal";
import useNotifier from "../hooks/useNotifier";
import UpdateSessionModal from "../session/UpdateSessionModal";

interface IOwnProps {
  isOpen: boolean;
}

const SessionTable = (props: IOwnProps) => {
  const [getPagedSessions, { data, isLoading, isFetching }] =
    useLazyGetSessionsPagedQuery();

  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentSelectedSession, setCurrentSelectedSession] =
    useState<SessionDto>();

  const [deleteSession] = useDeleteSessionMutation();
  const [updateSessionDetails] = useUpdateSessionDetailsMutation();

  const { openSuccessNotification, openErrorNotification, contextHolder } =
    useNotifier();

  const columns: TableProps<SessionDto>["columns"] = [
    {
      title: "Session ID",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        return (
          <div className="edit-session-title-button">
            {text}
            <Button
              icon={<EditOutlined />}
              type="primary"
              shape="circle"
              onClick={() => {
                setShowUpdateModal(true);
                setCurrentSelectedSession(record);
              }}
            />
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status"
    },
    {
      title: "Date created",
      dataIndex: "dateCreated",
      key: "dateCreated"
    },
    {
      title: "Date ended",
      dataIndex: "dateEnded",
      key: "dateEnded"
    },
    {
      title: "Voting System",
      key: "valueType",
      dataIndex: "valueType"
    },

    {
      title: "Action",
      key: "action",
      render: (record) => {
        return (
          <>
            <Flex gap="small" align="center" wrap>
              <Button
                icon={<DeleteOutlined />}
                type="primary"
                shape="circle"
                danger
                onClick={() => {
                  setShowDeleteModal(true);
                  setCurrentSelectedSession(record);
                }}
              ></Button>
            </Flex>
          </>
        );
      }
    }
  ];

  const handleSubmitDeleteSession = async (sessionId: number) => {
    try {
      await deleteSession(sessionId);
      openSuccessNotification(
        `The selected session has been permanently deleted.`
      );
    } catch (error: any) {
      const errorMessage = error?.data?.message || null;
      openErrorNotification(errorMessage);
    }
  };

  const handleSubmitUpdateSession = async (
    sessionId: number,
    title: string,
    customValues: string,
  ) => {
    try {
      await updateSessionDetails({
        sessionId: sessionId,
        title,
        customValues
      });
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
      {contextHolder}
      <div className="sessions-table-container">
        <GenericPaginatedTable<SessionDto>
          getPagedData={getPagedSessions}
          columns={columns}
          data={data ? data : ({} as PaginatedResponseDto<SessionDto>)}
          isLoading={isLoading}
          isFetching={isFetching}
        />
        {showUpdateModal && currentSelectedSession && (
          <UpdateSessionModal
            onUpdateOk={handleSubmitUpdateSession}
            currentSelectedSession={currentSelectedSession}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
        {showDeleteModal && currentSelectedSession && (
          <DeleteSessionModal
            currentSelectedSession={currentSelectedSession}
            onOk={handleSubmitDeleteSession}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default SessionTable;
