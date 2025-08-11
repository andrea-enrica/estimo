import {Button, Form, Modal, Select, SelectProps} from "antd";
import "../../styles/SessionPage.css";
import {useState} from "react";
import {useInviteUsersToSessionMutation} from "../../api/UserApi";
import {SessionDto} from "../../utils/dtos/SessionDto";
import {InviteRequestDto} from "../../utils/dtos/InviteRequestDto";

interface IOwnProps {
  onClose: () => void;
  users: SelectProps["options"];
  session: SessionDto | undefined;
}

export default function InviteUsersModal(props: IOwnProps) {
  const { onClose, users, session } = props;
  const [form] = Form.useForm();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteUsers] = useInviteUsersToSessionMutation();

  const handleOk = () => {
    if (session) {
      form.validateFields().then((values) => {
        form.resetFields();

        const inviteUsersData: InviteRequestDto = {
          invitedUsers: selectedUsers,
          session: session
        };
        inviteUsers({ newInvitedUsers: inviteUsersData });
        onClose();
      });
    }
  };

  const handleSelectedUsersChange = (value: string[]) => {
    setSelectedUsers(value);
  };

  return (
    <Modal
      title="Invite users to your session"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} shape="round">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          className="primary-button"
          htmlType="submit"
          form="inviteUsersForm"
        >
          Submit
        </Button>
      ]}
    >
      <Form
        id="inviteUsersForm"
        form={form}
        layout="vertical"
        onFinish={handleOk}
      >
        <br />
        <Form.Item
          label="Select users"
          name="valueType"
          rules={[{ required: true, message: "Please select users!" }]}
        >
          <Select
            className="selectUsers"
            showSearch
            mode="tags"
            options={users}
            onChange={handleSelectedUsersChange}
            placeholder="Search to Select"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
