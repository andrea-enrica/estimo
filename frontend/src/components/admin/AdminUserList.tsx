import {useState} from "react";
import {useSaveUserMutation} from "../../api/AdminApi";
import UserTable from "../user/UserTable";
import {Button, Card} from "antd";
import {UserDto} from "../../utils/dtos/UserDto";
import "../../styles/User.css";
import {UserAddOutlined} from "@ant-design/icons";
import CustomDashboard from "../user/CustomDashboard";
import {useLocation} from "react-router-dom";
import useNotifier from "../hooks/useNotifier";
import UserModal from "../user/UserModal";
import {UserModalEnum} from "../../utils/Enums";

export default function AdminUserList() {
  const [saveUser] = useSaveUserMutation();
  const [addUserModal, setAddUserModal] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const { openSuccessNotification, openErrorNotification, contextHolder } =
    useNotifier();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleAddUserModal = () => {
    setAddUserModal(!addUserModal);
  };

  const handleSubmitCreateUser = async (newUser: UserDto) => {
    try {
      await saveUser({ newUser }).unwrap();
      openSuccessNotification(
        `User ${newUser.fullName} has been added successfully.`
      );
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        "An unexpected error occurred. Please try again.";
      openErrorNotification(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="user-container">
        <CustomDashboard
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          currentPath={currentPath}
        />
        <Card className={`user-card ${isOpen ? "shifted" : ""}`}>
          <div className="card-header">
            <Button
              className="primary-button"
              type="primary"
              icon={<UserAddOutlined />}
              onClick={toggleAddUserModal}
            >
              Add User
            </Button>
          </div>
          <div className="card-content">
            <UserTable />
            {addUserModal && (
              <UserModal
                onOk={handleSubmitCreateUser}
                onClose={toggleAddUserModal}
                type={UserModalEnum.add}
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
