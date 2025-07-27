import { Button, Modal } from "antd";

interface IOwnProps {
  onOk: () => void;
  onCancel: () => void;
}

export default function LogoutModal(props: IOwnProps) {
  const { onOk, onCancel } = props;

  return (
    <>
      <Modal
        centered
        title="Confirm Log Out"
        open={true}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" type="default" onClick={onCancel} shape="round">
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={onOk}>
            Confirm
          </Button>
        ]}
      >
        <p>Are you sure you want to log out of your account?</p>
      </Modal>
    </>
  );
}
