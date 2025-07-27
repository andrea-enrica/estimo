import { Card } from "antd";
import React from "react";

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
}

const FlipCard: React.FC<FlipCardProps> = ({ frontContent, backContent }) => {
  return (
    <div className="flip-card">
      <div className="flip-card-in">
        <div className="flip-card-front">
          <Card hoverable className="flipped-card">
            {frontContent}
          </Card>
        </div>
        <div className="flip-card-back">
          <Card hoverable className="flipped-card flipped-card-back">
            {backContent}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
