import { Button, Flex, Form, Input, Modal, Rate } from "antd";
import { useState } from "react";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { AddFeedbackDto } from "../../utils/dtos/AddFeedbackDto";
import { useAddFeedbackMutation } from "../../api/SessionApi";

interface IOwnProps {
  userId: number;
  sessionId: number;
  onClose: () => void;
}

export default function AddFeedbackModal(props: IOwnProps) {
  const { userId, sessionId, onClose } = props;
  const [form] = Form.useForm();
  const [rating, setRating] = useState(0);
  const [addFeedback] = useAddFeedbackMutation();

  const handleOk = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      const feedbackData: AddFeedbackDto = {
        ...values,
        rating: rating
      };
      addFeedback({
        sessionId: sessionId,
        userId: userId,
        feedback: feedbackData
      });
      onClose();
    });
  };

  const handleChange = (value: number) => {
    setRating(value);
  };

  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />
  };

  return (
    <>
      <Modal
        centered
        title="Session Feedback"
        open={true}
        onCancel={onClose}
        onOk={handleOk}
        footer={[
          <Button key="back" onClick={onClose} shape="round">
            Cancel
          </Button>,
          <Button
            key="submit"
            className="primary-button"
            type="primary"
            htmlType="submit"
            form="addFeedbackForm"
          >
            Submit
          </Button>
        ]}
      >
        <Form
          id="addFeedbackForm"
          form={form}
          layout="vertical"
          onFinish={handleOk}
        >
          <Form.Item label="Feedback" name="feedback">
            <Input />
          </Form.Item>
          <Form.Item label="Rating" name="rating">
            <Flex gap="middle" vertical>
              <Rate
                defaultValue={3}
                onChange={handleChange}
                value={rating}
                character={({ index = 0 }) => customIcons[index + 1]}
              />
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
