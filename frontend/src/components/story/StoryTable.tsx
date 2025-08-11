import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Spin, Table } from "antd";
import { StoryDto } from "../../utils/dtos/StoryDto";
import { CreateStoryDto } from "../../utils/dtos/CreateStoryDto";
import CreateStoryModal from "./CreateStoryModal";
import { LocalStorageProperties, SessionDetails, UserRole } from "../../utils/Enums";
import { getAuthenticatedUserClaim } from "../../services/AuthService";

interface IOwnProps {
  storyList: StoryDto[];
  isLoading: boolean;
  isSessionActive: boolean;
  sessionId: number;
  sessionManagerId: number;
  userRole: string | undefined;
  createStory: (story: CreateStoryDto) => void;
}

const columns = [
  { title: "Title", dataIndex: "title" },
  { title: "Description", dataIndex: "description" },
  {
    title: "Average",
    dataIndex: "average",
    render: (value: string) => (value === "N/A"  || value === "" ? "" : value)
  },
];

const StoryTable: React.FC<IOwnProps> = (props: IOwnProps) => {
  const {
    storyList,
    isLoading,
    isSessionActive,
    sessionId,
    sessionManagerId,
    createStory,
    userRole,
  } = props;

  const authUserId = Number(getAuthenticatedUserClaim(LocalStorageProperties.id));
  const [dataSource, setDataSource] = useState<StoryDto[]>(storyList);
  const [createStoryModalVisible, setCreateStoryModalVisible] = useState(false);

  useEffect(() => {
    if (storyList) {
      setDataSource(storyList);
    }
  }, [storyList]);

  const toggleCreateStoryModal = () => {
    setCreateStoryModalVisible(!createStoryModalVisible);
  };

  return (
      <div>
        <div className="story-table-header">
          {UserRole.MANAGER === userRole && authUserId === sessionManagerId && (
              <Button
                  className="add-story-button primary-button"
                  type="primary"
                  onClick={toggleCreateStoryModal}
                  icon={<PlusOutlined />}
              >
                {SessionDetails.ADD_STORY}
              </Button>
          )}
          <br />
          {createStoryModalVisible && (
              <CreateStoryModal
                  onOk={createStory}
                  onClose={toggleCreateStoryModal}
                  sessionId={sessionId}
                  showButton={false}
                  isSessionActive={isSessionActive}
              />
          )}
        </div>
        {isLoading ? (
            <Spin size="large" />
        ) : (
            <div>
              <Table
                  rowKey="key"
                  columns={columns}
                  dataSource={dataSource} // Show all stories (no drag/drop)
                  pagination={false}
              />
            </div>
        )}
        <br />
        <br />
      </div>
  );
};

export default StoryTable;
