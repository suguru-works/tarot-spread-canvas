import { CARD_MASTER, filterCards, formatCardName } from "../data/cards.js?v=1.0.0-rc10";

const cardsById = new Map(CARD_MASTER.map((card) => [card.id, card]));

export function getCard(cardId) {
  return cardId ? cardsById.get(cardId) ?? null : null;
}

export function getCardName(card, display) {
  return formatCardName(card, display);
}

export function getCards(filterId = "all") {
  return filterCards(filterId);
}
