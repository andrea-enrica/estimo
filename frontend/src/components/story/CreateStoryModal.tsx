import {Button, Form, Input, List, Modal} from "antd";
import {CreateStoryDto} from "../../utils/dtos/CreateStoryDto";
import {useEffect, useState} from "react";
import {PlusOutlined} from "@ant-design/icons";

interface IOwnProps {
  onOk?: (story: CreateStoryDto) => void;
  onAddList?: (stories: CreateStoryDto[]) => void;
  onClose: () => void;
  sessionId: number;
  showButton: boolean;
  isSessionActive?: boolean;
}

export default function CreateStoryModal(props: IOwnProps) {
  const { onOk, onAddList, onClose, sessionId, showButton, isSessionActive } = props;
  const [storyList, setStoryList] = useState<CreateStoryDto[]>([]);
  const [form] = Form.useForm();
  const [title, setTitle] = useState<string>("");

  const handleOk = () => {
    if (!showButton) {
      form.validateFields().then((values) => {
        form.resetFields();
        const storyData: CreateStoryDto = {
          ...values,
          sessionId: sessionId
        };
        onOk!(storyData);
        onClose();
      });
    } else {
      if (storyList.length !== 0) onAddList!(storyList);
      onClose();
    }
  };

  const handleAdd = () => {
    console.log(form.getFieldValue("title"));
    form.validateFields()
        .then((values) => {
      if (values.title && values.title.length > 0) {
        form.resetFields();
        const storyData: CreateStoryDto = {
          ...values,
          sessionId: sessionId
        };
        setStoryList([...storyList, storyData]);
      }
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value); // Update local state for the title
  };

  useEffect(() => {
    if (storyList) {
      setStoryList(storyList);
    }
  }, [storyList]);

  const isSubmitDisabled = (isSessionActive && title.length === 0) || (!isSessionActive && storyList.length === 0);
  return (
      <Modal
        centered
        title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#395a6d' }}>Create a Story</span>}
        open={true}
        onCancel={onClose}
        onOk={handleOk}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="createStoryForm"
            className="primary-button"
            disabled={isSubmitDisabled}
          >
            Submit
          </Button>
        ]}
      >
        <Form
          id="createStoryForm"
          form={form}
          layout="vertical"
          onFinish={handleOk}
        >
          <Form.Item
              label="Title"
              name="title"
          >
            <Input value={title} onChange={handleTitleChange} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
        </Form>

        {showButton && (
          <Button
              disabled={!form.isFieldTouched("title") || title.length === 0}
              className="primary-button"
              onClick={handleAdd}
              type="primary"
              icon={<PlusOutlined/>}
          >
            Add
          </Button>
        )}

        {showButton && (
          <List
            itemLayout="horizontal"
            dataSource={storyList}
            renderItem={(item, index) => (
              <List.Item
                className="list-item"
                style={{
                  padding: '12px 16px',
                  margin: '8px 0',
                  backgroundColor: '#fff', // Background color for each item
                  borderRadius: '4px', // Rounded corners
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
                }}
              >
                <List.Item.Meta
                  title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#395a6d' }}>{item.title}</span>}
                  description={<span style={{ fontSize: '14px', color: '#395a6d' }}>{item.description}</span>}
                />
              </List.Item>
            )}
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '16px',
            }}
          />
        )}
      </Modal>
  );
}
