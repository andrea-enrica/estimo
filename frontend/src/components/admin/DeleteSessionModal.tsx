import {Button, Modal} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import "../../styles/User.css";
import {SessionDto} from "../../utils/dtos/SessionDto";

interface IOwnProps {
  onOk: (sessionId: number) => void;
  onClose: () => void;
  currentSelectedSession: SessionDto;
}

export default function DeleteSessionModal(props: IOwnProps) {
  const { onOk, onClose, currentSelectedSession } = props;

  const handleOnDeleteSession = () => {
    onOk(currentSelectedSession.id);
    onClose();
  };

  return (
    <Modal
      title="Delete session"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="Cancel" type="default" onClick={onClose} shape="round">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          className="delete-button"
          onClick={handleOnDeleteSession}
          icon={<DeleteOutlined />}
        >
          Delete
        </Button>
      ]}
    >
      <p>
        Are you sure you want to delete this session
        <strong> {currentSelectedSession.title}</strong>?
      </p>
    </Modal>
  );
}
