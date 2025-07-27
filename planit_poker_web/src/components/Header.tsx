import { UserOutlined } from "@ant-design/icons";
import estimoLogo from "../images/estimoLogo.png";
import "../styles/Header.css";
import "../styles/Profile.css";
import { useState } from "react";
import { Button } from "antd";
import ProfilePage from "./profile/ProfilePage";
import { useGetUserProfileQuery } from "../api/UserApi";
import { LocalStorageProperties } from "../utils/Enums";
import { getAuthenticatedUserClaim } from "../services/AuthService";

export default function Header() {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const { data: userDetails } = useGetUserProfileQuery({
    userId: Number(getAuthenticatedUserClaim(LocalStorageProperties.id))
  });

  const toggleProfileModal = () => {
    setIsProfileModalVisible(!isProfileModalVisible);
  };

  return (
    <div className="header-style">
      <div className="user-header">
        <Button
          className="header-profile-button"
          type="primary"
          onClick={toggleProfileModal}
          shape="round"
        >
          <UserOutlined />
        </Button>
        {isProfileModalVisible && <ProfilePage onClose={toggleProfileModal} />}
        Welcome {userDetails?.fullName}!
      </div>
    </div>
  );
}
