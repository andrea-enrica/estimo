import { Modal, Form, Input, Button, Select } from "antd";
import { UserDto, UserRole } from "../../utils/dtos/UserDto";
import "../../styles/User.css";
import { SaveOutlined } from "@ant-design/icons";
import { getAuthenticatedUserClaim } from "../../services/AuthService";
import { LocalStorageProperties, UserModalEnum } from "../../utils/Enums";

interface IOwnProps {
  onOk: (user: UserDto) => void;
  currentSelectedUser?: UserDto;
  onClose: () => void;
  type: string;
}

export default function UserModal(props: IOwnProps) {
  const { onOk, onClose, currentSelectedUser, type } = props;

  const [form] = Form.useForm();

  const userId = Number(getAuthenticatedUserClaim(LocalStorageProperties.id));

  const handleOnSubmit = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      const userDto: UserDto = {
        ...values,
        id: currentSelectedUser?.id
      };
      onOk(userDto);
      onClose();
    });
  };

  return (
    <Modal
      centered
      title={type === UserModalEnum.edit ? "Edit User" : "Add User"}
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} shape="round">
          Cancel
        </Button>,
        <Button
          key="submit"
          className="primary-button"
          type="primary"
          htmlType="submit"
          form="myForm"
          icon={<SaveOutlined />}
        >
          Submit
        </Button>
      ]}
    >
      <Form id="myForm" form={form} layout="vertical" onFinish={handleOnSubmit}>
        <Form.Item
          label="User Name"
          name="username"
          rules={[
            { required: true, message: "Please input the user name!" },
            { min: 3, message: "Username must be at least 3 characters long!" }
          ]}
          initialValue={
            type === UserModalEnum.edit
              ? currentSelectedUser?.username
              : undefined
          }
          required={true}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, message: "Please input the full name!" },
            { min: 3, message: "Please input a valid full name!" }
          ]}
          initialValue={
            type === UserModalEnum.edit
              ? currentSelectedUser?.fullName
              : undefined
          }
          required={true}
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
          initialValue={
            type === UserModalEnum.edit ? currentSelectedUser?.email : undefined
          }
          required={true}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          required={type === UserModalEnum.add}
          rules={[
            {
              required: type === UserModalEnum.add,
              message: "Please input the password!"
            }
          ]}
        >
          <Input.Password autoComplete="true" />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[
            { required: true, message: "Please input the phone number!" }
          ]}
          initialValue={
            type === UserModalEnum.edit
              ? currentSelectedUser?.phoneNumber
              : undefined
          }
          required={true}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please input the role!" }]}
          initialValue={
            type === UserModalEnum.edit ? currentSelectedUser?.role : undefined
          }
          required={true}
        >
          <Select
            className="select-role"
            options={[
              { value: UserRole.USER, label: "User" },
              { value: UserRole.ADMIN, label: "Admin" },
              { value: UserRole.MANAGER, label: "Manager" }
            ]}
            disabled={
              type === UserModalEnum.edit && currentSelectedUser?.id === userId
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
