import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {Card} from "antd";
import "../../styles/Home.css";
import CustomDashboard from "./CustomDashboard";
import useNotifier from "../hooks/useNotifier";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { openNotification, contextHolder } = useNotifier();

  const [welcomeShown, setWelcomeShown] = useState<boolean>(false);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (location.state?.showWelcomeNotification && !welcomeShown) {
      openNotification(
        "success",
        `Welcome, ${location.state.username}!`,
        `You have successfully logged in!`,
        "top",
        2
      );
      window.history.replaceState({}, document.title);
      setWelcomeShown(true);
    }
  }, [location.state, openNotification, welcomeShown]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {contextHolder}
      <div>
        <CustomDashboard
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          currentPath={currentPath}
        />
        <div className={`home-content ${isOpen ? "shifted" : ""}`}>
          <Card className="image-card"></Card>
          <div className="card-container">
            <Card className="home-cards-top-left">
              Total number of sessions
            </Card>
            <Card className="home-cards-top-right">
              Today number of session
            </Card>
            <Card className="home-cards-bottom-left"></Card>
            <Card className="home-cards-bottom-right"></Card>
          </div>
        </div>
      </div>
    </>
  );
}
