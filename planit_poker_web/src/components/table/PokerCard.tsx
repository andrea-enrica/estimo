import { Spin } from "antd";

import { LoadingOutlined, CheckCircleOutlined } from "@ant-design/icons";

interface PokerCardProps {
  value: string;
  isFlipped: boolean;
  isSelected?: boolean;
  onClick: () => void;
}
export default function PokerCard(props: PokerCardProps) {
  const { value, isFlipped, isSelected, onClick } = props;

  const calculateFontSize = (text: string) => {
    const baseSize = 45;
    const reductionFactor = 3;
    return Math.max(baseSize - text.length * reductionFactor, 20);
  };

  const fontSize = calculateFontSize(value);
  return (
    <div className="flipper" onClick={onClick}>
      <div className={`flipper-card ${isFlipped ? "" : "flipper-is-flipped"}`}>
        <div className={`flipper-front ${isSelected ? "selected-card" : ""}`}>
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
              width="90"
              height="140"
              rx="10"
              ry="15"
              fill={isSelected ? "#000099" : "#B1E3EE"}
              stroke={isSelected ? "#000099" : "#B1E3EE"}
              strokeWidth="7"
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily="Arial"
              fill={isSelected ? "#FFFFFF" : "#000099"}
              fontWeight="700"
            >
              {value}
            </text>
          </svg>
        </div>

        <div className="flipper-back">
          <div className="icons-container">
            {value ? (
              <CheckCircleOutlined className="check-icon" />
            ) : (
              <Spin
                indicator={<LoadingOutlined spin />}
                size="large"
                className="loading-icon"
              />
            )}
          </div>
          <svg
            className="svg-back"
            width="100%"
            height="100%"
            viewBox="0 0 100 150"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="5"
              y="5"
              width="90"
              height="140"
              rx="10"
              ry="15"
              fill="#000099"
              stroke="#000099"
              strokeWidth="7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
