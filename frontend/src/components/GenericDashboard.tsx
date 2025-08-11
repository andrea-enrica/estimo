import React, {useState} from "react";
import type {MenuProps} from "antd";
import {Layout, Menu} from "antd";
import "../styles/Dashboard.css";
import Header from "./Header";
import estimoLogo from "../images/estimoLogo.png";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

interface GenericLayoutProps {
  menuItems: MenuItem[];
  toggleSidebar: () => void;
  isOpen: boolean;
  currentPath: string;
}

const GenericDashboard: React.FC<GenericLayoutProps> = ({
  menuItems,
  toggleSidebar,
  currentPath
}) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="generic-dashboard">
      <Header />
      <Sider
        className="custom-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => {
          setCollapsed(value);
          toggleSidebar();
        }}
      >
        <div className="menu-sidebar" />
          <div className="logo-style">
              <img className="image-header-style" src={estimoLogo} alt="Estimo Logo" />
          </div>
        <Menu
          className="custom-menu"
          defaultSelectedKeys={[currentPath]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
    </div>
  );
};

export default GenericDashboard;
