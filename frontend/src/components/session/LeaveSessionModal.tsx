import {Button, Modal} from "antd";

interface IOwnProps {
  onOk: () => void;
  onClose: () => void;
}

export default function LeaveSessionModal(props: IOwnProps) {
  const { onOk, onClose } = props;

  const handleOnSubmit = () => {
    onOk();
  };

  return (
    <Modal
      centered
      title="Leave current session"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="Cancel" onClick={onClose} shape="round">
          Cancel
        </Button>,
        <Button className="primary-button" key="submit" type="primary" danger onClick={handleOnSubmit}>
          Leave
        </Button>
      ]}
    >
      <p>Are you sure you want to leave the current session?</p>
    </Modal>
  );
}
