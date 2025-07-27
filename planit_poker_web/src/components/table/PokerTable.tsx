import PokerCard from "./PokerCard";

import { CardDto } from "../../utils/dtos/CardDto";
import {Alert, Avatar, Button, Typography} from "antd";
import "../../styles/FooterCardSelection.css";
import {SessionDashboard} from "../../utils/Enums";
import {StoryDto} from "../../utils/dtos/StoryDto";
import {RetweetOutlined} from "@ant-design/icons";
import {useRef} from "react";
interface PokerTableProps {
  cards: CardDto[];
  toggleCardFlip: (index: number) => void;
  currentStory: StoryDto | null;
  onRevoteStory: () => void;
}

export default function PokerTable(props: PokerTableProps) {
  const { cards, toggleCardFlip, currentStory, onRevoteStory } = props;
  const refRevoteStory = useRef(null);

  const positions = [
    { x: "40%", y: "120%" },  // Bottom center : Player
    { x: "5%", y: "120%" },   // Bottom left
    { x: "-30%", y: "30%" },  // Center left
    { x: "5%", y: "-60%" },   // Top left
    { x: "40%", y: "-60%" },  // Top center
    { x: "75%", y: "-60%" },  // Top right
    { x: "110%", y: "30%" },  // Center right
    { x: "75%", y: "120%" }   // Bottom right
  ];

  return (
    <div className="tableContainer">
      <div className="table">
        <>
          {currentStory ? (
            <div className="table-content">
              <div className="current-story-title">
                {currentStory.title}
              </div>
              <Button
                  ref={refRevoteStory}
                  className="manager-button revote-button"
                  icon={<RetweetOutlined />}
                  onClick={onRevoteStory}
              >
                {SessionDashboard.REVOTE}
              </Button>
              {currentStory && currentStory.description !== null && (
                  <div className="current-story-description">
                    {SessionDashboard.STORY_DETAILS + ": "}{currentStory.description}
                  </div>

              )}
            </div>
          ) : (
              <div className="waiting-to-start-title">
                {SessionDashboard.WAITING_TO_START}{" "}
              </div>
          )}
        </>
        {positions.map((position, index) => {
          const card = cards[index];
          const { x, y } = position;

          let positionClass = "";
          if (y === "120%") {
            positionClass = "bottom-position";
          } else if (y === "-60%") {
            positionClass = "top-position";
          } else if (x === "-30%") {
            positionClass = "left-position";
          } else if (x === "110%") {
            positionClass = "right-position";
          }

          return (
            <div
              key={index}
              className={`cardPosition ${positionClass}`}
              style={{
                left: x,
                top: y
              }}
            >
              {card ? (
                <>
                  <PokerCard
                    value={card.value}
                    isFlipped={card.isFlipped}
                    onClick={() => toggleCardFlip(card.index)}
                  />
                  <div className="card-details">
                    <div className="card-username">{card.userFullName}</div>
                  </div>
                </>
              ) : (
                <div className="flipper">
                  <svg
                    className="svg-front"
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 150"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="5"
                      y="5"
                      width="100"
                      height="150"
                      rx="10"
                      ry="15"
                      fill="#e8e7e6"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
