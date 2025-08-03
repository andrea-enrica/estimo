import { Modal, Descriptions, Avatar, Typography, Button } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import "../../styles/Profile.css";
import { UserProfileDto } from "../../utils/dtos/UserProfileDto";

const { Title } = Typography;

interface IOwnProps {
  visible: boolean;
  userDetails: UserProfileDto;
  onEdit: () => void;
  onClose: () => void;
}

export default function ProfileModal(props: IOwnProps) {
  const { visible, userDetails, onEdit, onClose } = props;

  return (
    <Modal
      centered
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} shape="round">
          Close
        </Button>,
        <Button
          key="edit"
          className="primary-button"
          type="primary"
          icon={<EditOutlined />}
          onClick={onEdit}
        >
          Edit
        </Button>
      ]}
    >
      <div className="profile-modal-content">
        <Title level={2} className="profile-fullname">
          {userDetails.fullName}
        </Title>
        <Descriptions column={1} bordered className="profile-descriptions">
          <Descriptions.Item label="Username">
            {userDetails.username || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {userDetails.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            {userDetails.phoneNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">{userDetails.role}</Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}
