import React, { useContext, useEffect, useMemo, useState } from "react";
import { HolderOutlined, PlusOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import { StoryDto } from "../../utils/dtos/StoryDto";
import { CreateStoryDto } from "../../utils/dtos/CreateStoryDto";
import CreateStoryModal from "./CreateStoryModal";
import {LocalStorageProperties, SessionDetails, UserRole} from "../../utils/Enums";
import { getAuthenticatedUserClaim } from "../../services/AuthService";

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface IOwnProps {
  storyList: StoryDto[];
  isLoading: boolean;
  isSessionActive: boolean;
  sessionId: number;
  sessionManagerId: number;
  userRole: string | undefined;
  createStory: (story: CreateStoryDto) => void;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const columns: TableColumnsType<StoryDto> = [
  { key: "sort", align: "center", width: 100, render: () => <DragHandle /> },
  { title: "Title", dataIndex: "title"},
  { title: "Description", dataIndex: "description"},
  {
    title: "Average",
    dataIndex: "average",
    render: (value) => (value === "N/A" ? "" : value)
  }
];

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {})
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

const StoryTable: React.FC<IOwnProps> = (props: IOwnProps) => {
  const {
    storyList,
    isLoading,
    isSessionActive,
    sessionId,
    sessionManagerId,
    createStory,
    userRole
  } = props;
  const authUserId = Number(
    getAuthenticatedUserClaim(LocalStorageProperties.id)
  );
  const [dataSource, setDataSource] = useState<StoryDto[]>(storyList);
  const [createStoryModalVisible, setCreateStoryModalVisible] = useState(false);

  useEffect(() => {
    if (storyList) {
      setDataSource(storyList);
    }
  }, [storyList]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex(
          (record) => record.key === active?.id
        );
        const overIndex = prevState.findIndex(
          (record) => record.key === over?.id
        );

        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
  };

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
        <br/>
        {createStoryModalVisible && (
          <CreateStoryModal
            onOk={createStory}
            onClose={toggleCreateStoryModal}
            sessionId={sessionId}
            showButton={false}
          />
        )}
      </div>
      {isLoading ? (
        <Spin size="large" />
      ) : isSessionActive || authUserId !== sessionManagerId ? (
        <div>
          <Table
              rowKey="key"
              components={{ body: { row: Row } }}
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              // style={{borderRadius: "8px"}}
          />
        </div>
      ) : (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={dataSource.map((i) => i.key)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              rowKey="key"
              components={{ body: { row: Row } }}
              columns={columns}
              dataSource={dataSource}
              pagination={false}

            />
          </SortableContext>
        </DndContext>
      )}
      <br />
      <br />
    </div>
  );
};

export default StoryTable;
