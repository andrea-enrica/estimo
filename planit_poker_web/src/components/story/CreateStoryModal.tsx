import { Button, Form, Input, List, Modal } from "antd";
import { CreateStoryDto } from "../../utils/dtos/CreateStoryDto";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";

interface IOwnProps {
  onOk?: (story: CreateStoryDto) => void;
  onAddList?: (stories: CreateStoryDto[]) => void;
  onClose: () => void;
  sessionId: number;
  showButton: boolean;
}

export default function CreateStoryModal(props: IOwnProps) {
  const { onOk, onAddList, onClose, sessionId, showButton } = props;
  const [storyList, setStoryList] = useState<CreateStoryDto[]>([]);
  const [form] = Form.useForm();

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
    form.validateFields().then((values) => {
      form.resetFields();
      const storyData: CreateStoryDto = {
        ...values,
        sessionId: sessionId
      };
      setStoryList([...storyList, storyData]);
    });
  };

  useEffect(() => {
    if (storyList) {
      setStoryList(storyList);
    }
  }, [storyList]);

  return (
    <>
      <Modal
        centered
        title="Create a Story"
        open={true}
        onCancel={onClose}
        onOk={handleOk}
        footer={[
          <Button key="back" onClick={onClose} shape="round">
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="createStoryForm"
            className="primary-button"
            disabled={!showButton || storyList.length ? false : true}
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
          <Form.Item label="Title" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
        </Form>
        {showButton === true && (
          <Button className="primary-button" onClick={handleAdd} type="primary" icon={<PlusOutlined />}>
            Add
          </Button>
        )}
        {showButton === true && (
          <List
            itemLayout="horizontal"
            dataSource={storyList}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta title={item.title} />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
}
