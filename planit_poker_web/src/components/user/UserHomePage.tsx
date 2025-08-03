import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/HomeUser.css";
import CustomDashboard from "./CustomDashboard";
import {
  CommentOutlined,
  FileProtectOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  UsergroupAddOutlined
} from "@ant-design/icons";
import FlipCard from "../FlipCard";
import useNotifier from "../hooks/useNotifier";

export default function UserHomePage() {
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
      <div style={{overflow: "hidden"}}>
        <CustomDashboard
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          currentPath={currentPath}
        />
        <h2 className="first-style">
          Plan Smarter.
          <i className="best">{" "} Work Better.<br></br>
          </i>
          Collaborate with your team in the planner that keeps everyone aligned.
        </h2>
        <div className={`home-content ${isOpen ? "shifted" : ""}`}>
          <FlipCard
            frontContent={
              <>
                <CommentOutlined />
                <p className="text-size-front">Conversation starter</p>
              </>
            }
            backContent={
              <p className="text-size-back">
                Allow everyone to take a vote and start the debate based on the
                results.
              </p>
            }
          />
          <FlipCard
            frontContent={
              <>
                <FileProtectOutlined />
                <p className="text-size-front">
                  Easier and more efficient organization
                </p>
              </>
            }
            backContent={
              <p className="text-size-back">
                Create a new session, set the targets and start planning.
              </p>
            }
          />
          <FlipCard
            frontContent={
              <>
                <ClockCircleOutlined />
                <p className="text-size-front">Better time estimations</p>
              </>
            }
            backContent={
              <p className="text-size-back">
                Helps anticipate how much time a project needs based on tasks
                complexity and team experience.
              </p>
            }
          />
          <FlipCard
            frontContent={
              <>
                <UsergroupAddOutlined />
                <p className="text-size-front">Straightforward collaboration</p>
              </>
            }
            backContent={
              <p className="text-size-back">
                Increases team morale by giving everyone an equal voice
              </p>
            }
          />
        </div>
      </div>
    </>
  );
}
