import React, { useState, useEffect, useRef } from "react";
import SelectablePokerCard from "./SelectablePokerCard";
import "../../styles/FooterCardSelection.css";
import { CardSelectionDto } from "../../utils/dtos/CardSelectionDto";
import "../../styles/SelectablePokerCardStyle.css";

interface FooterCardSelectionProps {
  cards: CardSelectionDto[];
  onCardSelect: (card: CardSelectionDto) => void;
}

export default function FooterCardSelection(props: FooterCardSelectionProps) {
  const { cards, onCardSelect } = props;
  const [selectedCard, setSelectedCard] = useState<CardSelectionDto | null>(
    null
  );
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const footerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (card: CardSelectionDto) => {
    setSelectedCard(card);
    onCardSelect(card);
  };

  const toggleFooter = () => {
    setIsFooterVisible(!isFooterVisible);
  };

  return (
    <>
      <div
        ref={footerRef}
        className={`footer ${
          isFooterVisible ? "footer-visible" : "footer-hidden"
        }`}
      >
        <div className="footer-header" onClick={toggleFooter}>
          <h3 className="footer-title">Choose your card 👇</h3>
          <div
            className={`arrow-icon ${
              isFooterVisible ? "arrow-up" : "arrow-down"
            }`}
          />
        </div>
        {isFooterVisible && (
          <div className="footer-card-container">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`footer-card ${
                  selectedCard?.value === card.value ? "selected-card" : ""
                }`}
                onClick={() => handleCardClick(card)}
              >
                <SelectablePokerCard
                  value={card.value}
                  onClick={() => handleCardClick(card)}
                  isSelected={selectedCard?.value === card.value}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
