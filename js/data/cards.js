import {
  DISPLAY_RULES,
  TAROT_CARDS,
  getEnglishMinorName,
  getJapaneseMinorName,
  validateCardMaster as validateBaseCardMaster,
} from "../../card-master-base.js";

const SUIT_ORDER = Object.freeze({ wands: 0, swords: 1, pentacles: 2, cups: 3 });
const RANK_ORDER = Object.freeze({ ace: 1, page: 11, knight: 12, queen: 13, king: 14 });

function createThumbnailPath(sourceFile) {
  return sourceFile.replace(/^Cards\//, "assets/card-thumbnails/");
}

function getSortValue(card) {
  if (card.arcana === "major") return card.majorNumber;
  const suitOffset = 22 + SUIT_ORDER[card.suit] * 14;
  const rank = typeof card.rank === "number" ? card.rank : RANK_ORDER[card.rank];
  return suitOffset + rank - 1;
}

export const CARD_MASTER = Object.freeze(
  TAROT_CARDS
    .map((card) => Object.freeze({
      ...card,
      sortOrder: getSortValue(card),
      images: Object.freeze({
        thumbnail: createThumbnailPath(card.sourceFile),
        full: card.sourceFile,
      }),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder),
);

export const CARD_FILTERS = Object.freeze([
  Object.freeze({ id: "all", label: "すべて" }),
  Object.freeze({ id: "major", label: "大アルカナ" }),
  Object.freeze({ id: "wands", label: "ワンド" }),
  Object.freeze({ id: "swords", label: "ソード" }),
  Object.freeze({ id: "pentacles", label: "ペンタクル" }),
  Object.freeze({ id: "cups", label: "カップ" }),
]);

export const DEFAULT_CARD_NAME_DISPLAY = Object.freeze({
  language: "ja",
  suitStyle: "kana",
  numberStyle: "arabic",
  aceStyle: "kana",
  courtStyle: "kana",
});

function usesNumericAce(display) {
  return ["number", "arabic", "roman"].includes(display.aceStyle);
}

export function formatCardName(card, display = DEFAULT_CARD_NAME_DISPLAY) {
  if (!card) return "";

  if (display.language === "en") {
    return card.arcana === "major" ? card.names.en : getEnglishMinorName(card);
  }

  if (card.arcana === "major") return card.names.ja;
  const aceStyle = usesNumericAce(display) ? display.numberStyle : "kana";
  const compactName = getJapaneseMinorName(card, {
    suitStyle: display.suitStyle,
    numberStyle: display.numberStyle,
    aceStyle,
    courtStyle: display.courtStyle,
  });
  const suitLabel = DISPLAY_RULES.suits[card.suit]?.[display.suitStyle] ?? "";
  return suitLabel ? `${suitLabel} ${compactName.slice(suitLabel.length)}` : compactName;
}

export function filterCards(filterId) {
  if (filterId === "all") return CARD_MASTER;
  if (filterId === "major") return CARD_MASTER.filter((card) => card.arcana === "major");
  return CARD_MASTER.filter((card) => card.arcana === "minor" && card.suit === filterId);
}

export function getCardNameSettingAvailability(cards, display, displayCardNames = true) {
  const placedCards = cards.filter(Boolean);
  const minorCards = placedCards.filter((card) => card.arcana === "minor");
  const canCustomize = displayCardNames && display.language === "ja";
  const hasAce = minorCards.some((card) => card.rank === "ace");
  const hasNumberCard = minorCards.some((card) => (
    typeof card.rank === "number" && card.rank >= 2 && card.rank <= 10
  ));
  return Object.freeze({
    hasCards: placedCards.length > 0,
    suit: canCustomize && minorCards.length > 0,
    number: canCustomize && (hasNumberCard || (hasAce && usesNumericAce(display))),
    ace: canCustomize && hasAce,
    court: canCustomize && minorCards.some((card) => (
      ["page", "knight", "queen", "king"].includes(card.rank)
    )),
  });
}

export function validateCardMaster() {
  const errors = [...validateBaseCardMaster()];
  const ids = new Set();
  const sortOrders = new Set();

  CARD_MASTER.forEach((card) => {
    if (ids.has(card.id)) errors.push(`重複ID: ${card.id}`);
    if (sortOrders.has(card.sortOrder)) errors.push(`並び順重複: ${card.id}`);
    ids.add(card.id);
    sortOrders.add(card.sortOrder);
    if (!card.images.thumbnail || !card.images.full) errors.push(`画像パス未設定: ${card.id}`);
  });

  return errors;
}

export { DISPLAY_RULES };
