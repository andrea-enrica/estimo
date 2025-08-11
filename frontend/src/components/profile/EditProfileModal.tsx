import {Button, Form, Input, Modal, Select} from "antd";
import {UserDto, UserRole} from "../../utils/dtos/UserDto";
import "../../styles/User.css";
import {UserProfileDto} from "../../utils/dtos/UserProfileDto";
import {type} from "node:os";
import {UserModalEnum} from "../../utils/Enums";

interface IOwnProps {
  visible: boolean;
  userDetails: UserProfileDto;
  onOk: (user: UserDto) => void;
  onCancel: () => void;
}

export default function EditProfileModal(props: IOwnProps) {
  const { visible, userDetails, onOk, onCancel } = props;
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      values.id = userDetails.id;
      onOk(values as UserDto);
    });
  };

  return (
    <Modal
      centered
      title="Edit Profile"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} shape="round">
          Cancel
        </Button>,
        <Button
          className="primary-button"
          key="submit"
          type="primary"
          htmlType="submit"
          form="editProfileForm"
        >
          Submit
        </Button>
      ]}
    >
      <Form
        id="editProfileForm"
        form={form}
        layout="vertical"
        initialValues={userDetails}
        onFinish={handleOk}
      >
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, message: "Please input the full name!" },
            { min: 1, message: "Please input a valid full name!" }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true, message: "Please input the username!" },
            { min: 3, message: "Username must be at least 3 characters long!" }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input the email!"
            }
          ]}
        >
          <Input disabled={true} />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[
            { required: true, message: "Please input the phone number!" }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please input the role!" }]}
        >
          <Select
            className="edit-profile-select"
            options={[
              { value: UserRole.USER, label: "User" },
              { value: UserRole.ADMIN, label: "Admin" }
            ]}
            disabled={true}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
