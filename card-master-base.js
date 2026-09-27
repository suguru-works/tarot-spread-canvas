/**
 * Tarot Spread Canvas - Card Master Base
 *
 * 使い方
 * - 各カードの sourceFile: "" に元画像ファイル名を入力してください。
 * - 大アルカナだけ names.ja を正式な日本語表記で入力してください。
 * - 小アルカナ名は suit / rank と DISPLAY_RULES から生成します。
 */

export const DISPLAY_RULES = {
  suits: {
    wands: { kanji: "棒", kana: "ワンド", en: "Wands" },
    swords: { kanji: "剣", kana: "ソード", en: "Swords" },
    pentacles: { kanji: "金貨", kana: "ペンタクル", en: "Pentacles" },
    cups: { kanji: "杯", kana: "カップ", en: "Cups" },
  },

  numberStyles: {
    arabic: { 2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10" },
    roman: { 2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX",10:"X" },
  },

  courtLabels: {
    page: { kanji:"従者", kana:"ペイジ", en:"Page" },
    knight: { kanji:"騎士", kana:"ナイト", en:"Knight" },
    queen: { kanji:"女王", kana:"クイーン", en:"Queen" },
    king: { kanji:"王", kana:"キング", en:"King" },
  },

  aceLabels: {
    arabic: "1",
    roman: "I",
    kana: "エース",
    en: "Ace",
  },
};

export const TAROT_CARDS = [
  {
    id: "major_00",
    sourceFile: "Cards/rws-00-the-fool.jpg",
    arcana: "major",
    majorNumber: 0,
    suit: null,
    rank: null,
    names: { ja: "愚者", en: "The Fool" },
  },
  {
    id: "major_01",
    sourceFile: "Cards/rws-01-the-magician.jpg",
    arcana: "major",
    majorNumber: 1,
    suit: null,
    rank: null,
    names: { ja: "魔術師", en: "The Magician" },
  },
  {
    id: "major_02",
    sourceFile: "Cards/rws-02-the-high-priestess.jpg",
    arcana: "major",
    majorNumber: 2,
    suit: null,
    rank: null,
    names: { ja: "女教皇", en: "The High Priestess" },
  },
  {
    id: "major_03",
    sourceFile: "Cards/rws-03-the-empress.jpg",
    arcana: "major",
    majorNumber: 3,
    suit: null,
    rank: null,
    names: { ja: "女帝", en: "The Empress" },
  },
  {
    id: "major_04",
    sourceFile: "Cards/rws-04-the-emperor.jpg",
    arcana: "major",
    majorNumber: 4,
    suit: null,
    rank: null,
    names: { ja: "皇帝", en: "The Emperor" },
  },
  {
    id: "major_05",
    sourceFile: "Cards/rws-05-the-hierophant.jpg",
    arcana: "major",
    majorNumber: 5,
    suit: null,
    rank: null,
    names: { ja: "法王", en: "The Hierophant" },
  },
  {
    id: "major_06",
    sourceFile: "Cards/rws-06-the-lovers.jpg",
    arcana: "major",
    majorNumber: 6,
    suit: null,
    rank: null,
    names: { ja: "恋人たち", en: "The Lovers" },
  },
  {
    id: "major_07",
    sourceFile: "Cards/rws-07-the-chariot.jpg",
    arcana: "major",
    majorNumber: 7,
    suit: null,
    rank: null,
    names: { ja: "戦車", en: "The Chariot" },
  },
  {
    id: "major_08",
    sourceFile: "Cards/rws-08-strength.jpg",
    arcana: "major",
    majorNumber: 8,
    suit: null,
    rank: null,
    names: { ja: "力", en: "Strength" },
  },
  {
    id: "major_09",
    sourceFile: "Cards/rws-09-the-hermit.jpg",
    arcana: "major",
    majorNumber: 9,
    suit: null,
    rank: null,
    names: { ja: "隠者", en: "The Hermit" },
  },
  {
    id: "major_10",
    sourceFile: "Cards/rws-10-wheel-of-fortune.jpg",
    arcana: "major",
    majorNumber: 10,
    suit: null,
    rank: null,
    names: { ja: "運命の輪", en: "Wheel of Fortune" },
  },
  {
    id: "major_11",
    sourceFile: "Cards/rws-11-justice.jpg",
    arcana: "major",
    majorNumber: 11,
    suit: null,
    rank: null,
    names: { ja: "正義", en: "Justice" },
  },
  {
    id: "major_12",
    sourceFile: "Cards/rws-12-the-hanged-man.jpg",
    arcana: "major",
    majorNumber: 12,
    suit: null,
    rank: null,
    names: { ja: "吊るされた男", en: "The Hanged Man" },
  },
  {
    id: "major_13",
    sourceFile: "Cards/rws-13-death.jpg",
    arcana: "major",
    majorNumber: 13,
    suit: null,
    rank: null,
    names: { ja: "死神", en: "Death" },
  },
  {
    id: "major_14",
    sourceFile: "Cards/rws-14-temperance.jpg",
    arcana: "major",
    majorNumber: 14,
    suit: null,
    rank: null,
    names: { ja: "節制", en: "Temperance" },
  },
  {
    id: "major_15",
    sourceFile: "Cards/rws-15-the-devil.jpg",
    arcana: "major",
    majorNumber: 15,
    suit: null,
    rank: null,
    names: { ja: "悪魔", en: "The Devil" },
  },
  {
    id: "major_16",
    sourceFile: "Cards/rws-16-the-tower.jpg",
    arcana: "major",
    majorNumber: 16,
    suit: null,
    rank: null,
    names: { ja: "塔", en: "The Tower" },
  },
  {
    id: "major_17",
    sourceFile: "Cards/rws-17-the-star.jpg",
    arcana: "major",
    majorNumber: 17,
    suit: null,
    rank: null,
    names: { ja: "星", en: "The Star" },
  },
  {
    id: "major_18",
    sourceFile: "Cards/rws-18-the-moon.jpg",
    arcana: "major",
    majorNumber: 18,
    suit: null,
    rank: null,
    names: { ja: "月", en: "The Moon" },
  },
  {
    id: "major_19",
    sourceFile: "Cards/rws-19-the-sun.jpg",
    arcana: "major",
    majorNumber: 19,
    suit: null,
    rank: null,
    names: { ja: "太陽", en: "The Sun" },
  },
  {
    id: "major_20",
    sourceFile: "Cards/rws-20-judgement.jpg",
    arcana: "major",
    majorNumber: 20,
    suit: null,
    rank: null,
    names: { ja: "審判", en: "Judgement" },
  },
  {
    id: "major_21",
    sourceFile: "Cards/rws-21-the-world.jpg",
    arcana: "major",
    majorNumber: 21,
    suit: null,
    rank: null,
    names: { ja: "世界", en: "The World" },
  },
  {
    id: "wands_ace",
    sourceFile: "Cards/rws-22-ace-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: "ace",
  },
  {
    id: "wands_02",
    sourceFile: "Cards/rws-23-two-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 2,
  },
  {
    id: "wands_03",
    sourceFile: "Cards/rws-24-three-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 3,
  },
  {
    id: "wands_04",
    sourceFile: "Cards/rws-25-four-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 4,
  },
  {
    id: "wands_05",
    sourceFile: "Cards/rws-26-five-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 5,
  },
  {
    id: "wands_06",
    sourceFile: "Cards/rws-27-six-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 6,
  },
  {
    id: "wands_07",
    sourceFile: "Cards/rws-28-seven-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 7,
  },
  {
    id: "wands_08",
    sourceFile: "Cards/rws-29-eight-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 8,
  },
  {
    id: "wands_09",
    sourceFile: "Cards/rws-30-nine-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 9,
  },
  {
    id: "wands_10",
    sourceFile: "Cards/rws-31-ten-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: 10,
  },
  {
    id: "wands_page",
    sourceFile: "Cards/rws-32-page-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: "page",
  },
  {
    id: "wands_knight",
    sourceFile: "Cards/rws-33-knight-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: "knight",
  },
  {
    id: "wands_queen",
    sourceFile: "Cards/rws-34-queen-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: "queen",
  },
  {
    id: "wands_king",
    sourceFile: "Cards/rws-35-king-of-wands.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "wands",
    rank: "king",
  },
  {
    id: "swords_ace",
    sourceFile: "Cards/rws-36-ace-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: "ace",
  },
  {
    id: "swords_02",
    sourceFile: "Cards/rws-37-two-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 2,
  },
  {
    id: "swords_03",
    sourceFile: "Cards/rws-38-three-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 3,
  },
  {
    id: "swords_04",
    sourceFile: "Cards/rws-39-four-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 4,
  },
  {
    id: "swords_05",
    sourceFile: "Cards/rws-40-five-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 5,
  },
  {
    id: "swords_06",
    sourceFile: "Cards/rws-41-six-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 6,
  },
  {
    id: "swords_07",
    sourceFile: "Cards/rws-42-seven-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 7,
  },
  {
    id: "swords_08",
    sourceFile: "Cards/rws-43-eight-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 8,
  },
  {
    id: "swords_09",
    sourceFile: "Cards/rws-44-nine-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 9,
  },
  {
    id: "swords_10",
    sourceFile: "Cards/rws-45-ten-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: 10,
  },
  {
    id: "swords_page",
    sourceFile: "Cards/rws-46-page-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: "page",
  },
  {
    id: "swords_knight",
    sourceFile: "Cards/rws-47-knight-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: "knight",
  },
  {
    id: "swords_queen",
    sourceFile: "Cards/rws-48-queen-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: "queen",
  },
  {
    id: "swords_king",
    sourceFile: "Cards/rws-49-king-of-swords.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "swords",
    rank: "king",
  },
  {
    id: "pentacles_ace",
    sourceFile: "Cards/rws-50-ace-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: "ace",
  },
  {
    id: "pentacles_02",
    sourceFile: "Cards/rws-51-two-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 2,
  },
  {
    id: "pentacles_03",
    sourceFile: "Cards/rws-52-three-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 3,
  },
  {
    id: "pentacles_04",
    sourceFile: "Cards/rws-53-four-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 4,
  },
  {
    id: "pentacles_05",
    sourceFile: "Cards/rws-54-five-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 5,
  },
  {
    id: "pentacles_06",
    sourceFile: "Cards/rws-55-six-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 6,
  },
  {
    id: "pentacles_07",
    sourceFile: "Cards/rws-56-seven-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 7,
  },
  {
    id: "pentacles_08",
    sourceFile: "Cards/rws-57-eight-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 8,
  },
  {
    id: "pentacles_09",
    sourceFile: "Cards/rws-58-nine-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 9,
  },
  {
    id: "pentacles_10",
    sourceFile: "Cards/rws-59-ten-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: 10,
  },
  {
    id: "pentacles_page",
    sourceFile: "Cards/rws-60-page-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: "page",
  },
  {
    id: "pentacles_knight",
    sourceFile: "Cards/rws-61-knight-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: "knight",
  },
  {
    id: "pentacles_queen",
    sourceFile: "Cards/rws-62-queen-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: "queen",
  },
  {
    id: "pentacles_king",
    sourceFile: "Cards/rws-63-king-of-pentacles.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "pentacles",
    rank: "king",
  },
  {
    id: "cups_ace",
    sourceFile: "Cards/rws-64-ace-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: "ace",
  },
  {
    id: "cups_02",
    sourceFile: "Cards/rws-65-two-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 2,
  },
  {
    id: "cups_03",
    sourceFile: "Cards/rws-66-three-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 3,
  },
  {
    id: "cups_04",
    sourceFile: "Cards/rws-67-four-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 4,
  },
  {
    id: "cups_05",
    sourceFile: "Cards/rws-68-five-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 5,
  },
  {
    id: "cups_06",
    sourceFile: "Cards/rws-69-six-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 6,
  },
  {
    id: "cups_07",
    sourceFile: "Cards/rws-70-seven-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 7,
  },
  {
    id: "cups_08",
    sourceFile: "Cards/rws-71-eight-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 8,
  },
  {
    id: "cups_09",
    sourceFile: "Cards/rws-72-nine-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 9,
  },
  {
    id: "cups_10",
    sourceFile: "Cards/rws-73-ten-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: 10,
  },
  {
    id: "cups_page",
    sourceFile: "Cards/rws-74-page-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: "page",
  },
  {
    id: "cups_knight",
    sourceFile: "Cards/rws-75-knight-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: "knight",
  },
  {
    id: "cups_queen",
    sourceFile: "Cards/rws-76-queen-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: "queen",
  },
  {
    id: "cups_king",
    sourceFile: "Cards/rws-77-king-of-cups.jpg",
    arcana: "minor",
    majorNumber: null,
    suit: "cups",
    rank: "king",
  },
];

export function getEnglishMinorName(card) {
  if (card.arcana !== "minor") return card.names?.en ?? "";
  const suit = DISPLAY_RULES.suits[card.suit]?.en ?? card.suit;
  const numberWords = {
    2:"Two", 3:"Three", 4:"Four", 5:"Five",
    6:"Six", 7:"Seven", 8:"Eight", 9:"Nine", 10:"Ten"
  };
  if (card.rank === "ace") return `Ace of ${suit}`;
  if (typeof card.rank === "number") return `${numberWords[card.rank]} of ${suit}`;
  const court = DISPLAY_RULES.courtLabels[card.rank]?.en ?? card.rank;
  return `${court} of ${suit}`;
}

export function getJapaneseMinorName(
  card,
  {
    suitStyle = "kana",
    numberStyle = "arabic",
    courtStyle = "kana",
    aceStyle = "kana",
    separator = "",
  } = {},
) {
  if (card.arcana !== "minor") return card.names?.ja ?? "";

  const suit = DISPLAY_RULES.suits[card.suit]?.[suitStyle] ?? card.suit;
  let rankLabel = "";

  if (card.rank === "ace") {
    rankLabel = DISPLAY_RULES.aceLabels[aceStyle] ?? "エース";
  } else if (typeof card.rank === "number") {
    rankLabel = DISPLAY_RULES.numberStyles[numberStyle]?.[card.rank] ?? String(card.rank);
  } else {
    rankLabel = DISPLAY_RULES.courtLabels[card.rank]?.[courtStyle] ?? String(card.rank);
  }

  return `${suit}${separator}${rankLabel}`;
}

export function validateCardMaster() {
  const errors = [];

  if (TAROT_CARDS.length !== 78) {
    errors.push(`カード枚数が78枚ではありません: ${TAROT_CARDS.length}`);
  }

  const ids = new Set();
  for (const card of TAROT_CARDS) {
    if (ids.has(card.id)) errors.push(`重複ID: ${card.id}`);
    ids.add(card.id);

    if (!card.sourceFile) errors.push(`sourceFile 未設定: ${card.id}`);

    if (card.arcana === "major" && !card.names?.ja) {
      errors.push(`大アルカナ日本語名 未設定: ${card.id}`);
    }
  }

  return errors;
}
