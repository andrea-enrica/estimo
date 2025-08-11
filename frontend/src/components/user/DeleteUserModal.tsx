import {Button, Modal} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import "../../styles/User.css";

interface IOwnProps {
  onOk: (userId: number) => void;
  onClose: () => void;
  currentSelectedUserId: number;
  currentSelectedUserFullName: string;
}

export default function DeleteUserModal(props: IOwnProps) {
  const { onOk, onClose, currentSelectedUserId, currentSelectedUserFullName } =
    props;

  const handleOnDeleteUser = () => {
    onOk(currentSelectedUserId);
    onClose();
  };

  return (
    <Modal
      centered
      title="Delete user"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="Cancel" type="default" onClick={onClose} shape="round">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          className="delete-button"
          onClick={handleOnDeleteUser}
          icon={<DeleteOutlined />}
        >
          Delete
        </Button>
      ]}
    >
      <p>
        Are you sure you want to delete the user
        <strong> {currentSelectedUserFullName}</strong>?
      </p>
    </Modal>
  );
}
