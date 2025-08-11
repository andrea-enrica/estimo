interface SelectablePokerCardProps {
  value: string;
  onClick: () => void;
  isSelected?: boolean;
}

export default function SelectablePokerCard(props: SelectablePokerCardProps) {
  const { value, onClick, isSelected } = props;

  const calculateFontSize = (text: string) => {
    const baseSize = 45;
    const reductionFactor = 3;
    return Math.max(baseSize - text.length * reductionFactor, 20);
  };

  const fontSize = calculateFontSize(value);

  return (
    <div className="selectable-card" onClick={onClick}>
      <div
        className={`selectable-card-inner ${isSelected ? "selected-card" : ""}`}
      >
        <svg
          className="footer-svg-card"
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
            fill={isSelected ? "#395a6d" : "#5c859e"}
            stroke={isSelected ? "#395a6d" : "#5c859e"}
            strokeWidth="7"
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={fontSize}
            fontFamily="Arial"
            fill={isSelected ? "#FFFFFF" : "#395a6d"}
            fontWeight="700"
          >
            {value}
          </text>
        </svg>
      </div>
    </div>
  );
}
