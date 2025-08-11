import React, {useState} from "react";
import {BookOutlined, HomeOutlined, LogoutOutlined, UnorderedListOutlined} from "@ant-design/icons";
import type {MenuProps} from "antd";
import GenericDashboard from "../GenericDashboard";
import {Link, useNavigate} from "react-router-dom";
import {LocalStorageProperties, UserRole} from "../../utils/Enums";
import {clearAuthenticatedUserData, getAuthenticatedUserClaim} from "../../services/AuthService";
import LogoutModal from "../LogoutModal";
import {RoutePaths} from "../../utils/constants/RoutePaths";

type MenuItem = Required<MenuProps>["items"][number];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPath: string;
}

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  onClick?: () => void,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    onClick
  } as MenuItem;
}

const CustomDashboard: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  currentPath
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const role = getAuthenticatedUserClaim(LocalStorageProperties.role);

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  const handleConfirmLogout = () => {
    clearAuthenticatedUserData();
    navigate(RoutePaths.LOGIN);
  };

  const adminItems: MenuItem[] = [
    getItem(
      <Link to="/admin-user-manager/home">Home</Link>,
      "/admin/home",
      <HomeOutlined />
    ),
    getItem(
      <Link to="/admin/users-list">Users List</Link>,
      "/admin/users-list",
      <UnorderedListOutlined />
    ),
    getItem(
      <Link to="/admin/sessions-list">Sessions List</Link>,
      "/admin/sessions-list",
      <BookOutlined />
    ),
    getItem("Log Out", "4", <LogoutOutlined />, toggleLogoutModal)
  ];

  const userItems: MenuItem[] = [
    getItem(
      <Link to="/admin-user-manager/home">Home</Link>,
      "/admin-user-manager/home",
      <HomeOutlined />
    ),
    getItem(
      <Link to="/user-manager/sessions">Sessions List</Link>,
      "/user-manager/sessions",
      <BookOutlined />
    ),
    getItem("Log Out", "4", <LogoutOutlined />, toggleLogoutModal)
  ];

  return (
    <>
      <GenericDashboard
        menuItems={role === UserRole.ADMIN ? adminItems : userItems}
        toggleSidebar={toggleSidebar}
        isOpen={isOpen}
        currentPath={currentPath}
      ></GenericDashboard>

      {showLogoutModal && (
        <LogoutModal onOk={handleConfirmLogout} onCancel={toggleLogoutModal} />
      )}
    </>
  );
};

export default CustomDashboard;
