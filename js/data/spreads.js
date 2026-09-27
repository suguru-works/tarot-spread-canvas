export const CHOICE_SPREAD_DEFAULTS = Object.freeze({
  optionCount: 2,
  commonEnabled: true,
});

const CHOICE_OPTION_COUNTS = Object.freeze([2, 3, 4]);
const CHOICE_COLUMN_GAP = 550;
const CHOICE_COLUMN_START_X = 425;
const CHOICE_CARD_SIZE = Object.freeze({ width: 260, height: 442 });

function normalizeChoiceSettings(settings = CHOICE_SPREAD_DEFAULTS) {
  const optionCount = CHOICE_OPTION_COUNTS.includes(Number(settings.optionCount))
    ? Number(settings.optionCount)
    : CHOICE_SPREAD_DEFAULTS.optionCount;
  return {
    optionCount,
    commonEnabled: Boolean(settings.commonEnabled),
  };
}

function createChoiceSlot(id, name, centerX, centerY, drawOrder) {
  return Object.freeze({
    id,
    name,
    drawOrder,
    placement: Object.freeze({
      centerX,
      centerY,
      width: CHOICE_CARD_SIZE.width,
      height: CHOICE_CARD_SIZE.height,
      rotation: 0,
    }),
  });
}

export function createChoiceSpreadDefinition(settings = CHOICE_SPREAD_DEFAULTS) {
  const normalized = normalizeChoiceSettings(settings);
  const canvasWidth = CHOICE_COLUMN_START_X * 2
    + (normalized.optionCount - 1) * CHOICE_COLUMN_GAP;
  const canvasHeight = normalized.commonEnabled ? 2150 : 1500;
  const groupLabelY = normalized.commonEnabled ? 150 : 130;
  const firstCardY = normalized.commonEnabled ? 1110 : 1010;
  const secondCardY = normalized.commonEnabled ? 480 : 380;
  const slots = [];
  let drawOrder = 1;

  if (normalized.commonEnabled) {
    slots.push(createChoiceSlot("common", "共通カード", canvasWidth / 2, 1700, drawOrder));
    drawOrder += 1;
  }

  const groups = Array.from({ length: normalized.optionCount }, (_, index) => {
    const optionNumber = index + 1;
    const centerX = CHOICE_COLUMN_START_X + index * CHOICE_COLUMN_GAP;
    slots.push(createChoiceSlot(
      `option-${optionNumber}-card-1`,
      `選択肢${optionNumber}・1枚目`,
      centerX,
      firstCardY,
      drawOrder,
    ));
    drawOrder += 1;
    slots.push(createChoiceSlot(
      `option-${optionNumber}-card-2`,
      `選択肢${optionNumber}・2枚目`,
      centerX,
      secondCardY,
      drawOrder,
    ));
    drawOrder += 1;
    return Object.freeze({
      id: `option-${optionNumber}`,
      name: `選択肢${optionNumber}`,
      caption: Object.freeze({ centerX, y: groupLabelY, maxWidth: 460 }),
    });
  });

  return Object.freeze({
    id: "choice-spread",
    slug: "choice-spread",
    name: "選択式スプレッド",
    names: Object.freeze({ ja: "選択式スプレッド", en: "Choice Spread" }),
    kind: "choice",
    cardCount: slots.length,
    canvas: Object.freeze({ width: canvasWidth, height: canvasHeight }),
    groups: Object.freeze(groups),
    slots: Object.freeze(slots),
    settings: Object.freeze(normalized),
  });
}

export const SPREADS = Object.freeze([
  Object.freeze({
    id: "one-oracle",
    slug: "one-oracle",
    name: "ワンオラクル",
    names: Object.freeze({ ja: "ワンオラクル", en: "One-Card Spread" }),
    cardCount: 1,
    canvas: Object.freeze({ width: 1200, height: 1000 }),
    slots: Object.freeze([
      Object.freeze({
        id: "card-1",
        name: "1枚目",
        drawOrder: 1,
        placement: Object.freeze({ centerX: 600, width: 430, height: 650, rotation: 0 }),
      }),
    ]),
  }),
  Object.freeze({
    id: "two-oracle",
    slug: "two-oracle",
    name: "ツーオラクル",
    names: Object.freeze({ ja: "ツーオラクル", en: "Two-Card Spread" }),
    cardCount: 2,
    canvas: Object.freeze({ width: 1600, height: 1000 }),
    slots: Object.freeze([
      Object.freeze({
        id: "card-1",
        name: "左のカード",
        drawOrder: 1,
        placement: Object.freeze({ centerX: 535, width: 430, height: 650, rotation: 0 }),
      }),
      Object.freeze({
        id: "card-2",
        name: "右のカード",
        drawOrder: 2,
        placement: Object.freeze({ centerX: 1065, width: 430, height: 650, rotation: 0 }),
      }),
    ]),
  }),
  Object.freeze({
    id: "two-mind",
    slug: "two-mind",
    name: "ツーマインド",
    names: Object.freeze({ ja: "ツーマインド", en: "Two-Mind Spread" }),
    cardCount: 2,
    canvas: Object.freeze({ width: 1050, height: 1500 }),
    slots: Object.freeze([
      Object.freeze({
        id: "card-1",
        name: "上のカード",
        drawOrder: 1,
        placement: Object.freeze({ centerX: 525, centerY: 410, width: 280, height: 476, rotation: 0 }),
      }),
      Object.freeze({
        id: "card-2",
        name: "下のカード",
        drawOrder: 2,
        placement: Object.freeze({ centerX: 525, centerY: 1030, width: 280, height: 476, rotation: 0 }),
      }),
    ]),
  }),
  Object.freeze({
    id: "three-card",
    slug: "three-card",
    name: "スリーカード",
    names: Object.freeze({ ja: "スリーカード", en: "Three-Card Spread" }),
    cardCount: 3,
    canvas: Object.freeze({ width: 2000, height: 1000 }),
    slots: Object.freeze([
      Object.freeze({
        id: "card-1",
        name: "1枚目",
        drawOrder: 1,
        placement: Object.freeze({ centerX: 450, width: 430, height: 650, rotation: 0 }),
      }),
      Object.freeze({
        id: "card-2",
        name: "2枚目",
        drawOrder: 2,
        placement: Object.freeze({ centerX: 1000, width: 430, height: 650, rotation: 0 }),
      }),
      Object.freeze({
        id: "card-3",
        name: "3枚目",
        drawOrder: 3,
        placement: Object.freeze({ centerX: 1550, width: 430, height: 650, rotation: 0 }),
      }),
    ]),
  }),
  Object.freeze({
    id: "horseshoe",
    slug: "horseshoe",
    name: "ホースシュー",
    names: Object.freeze({ ja: "ホースシュー", en: "Horseshoe Spread" }),
    cardCount: 7,
    canvas: Object.freeze({ width: 2800, height: 1400 }),
    slots: Object.freeze([
      Object.freeze({ id: "card-1", name: "1枚目", drawOrder: 1, placement: Object.freeze({ centerX: 300, centerY: 340, width: 260, height: 442, rotation: 0 }) }),
      Object.freeze({ id: "card-2", name: "2枚目", drawOrder: 2, placement: Object.freeze({ centerX: 650, centerY: 650, width: 260, height: 442, rotation: 0 }) }),
      Object.freeze({ id: "card-3", name: "3枚目", drawOrder: 3, placement: Object.freeze({ centerX: 1000, centerY: 850, width: 260, height: 442, rotation: 0 }) }),
      Object.freeze({ id: "card-4", name: "4枚目", drawOrder: 4, placement: Object.freeze({ centerX: 1400, centerY: 950, width: 260, height: 442, rotation: 0 }) }),
      Object.freeze({ id: "card-5", name: "5枚目", drawOrder: 5, placement: Object.freeze({ centerX: 1800, centerY: 850, width: 260, height: 442, rotation: 0 }) }),
      Object.freeze({ id: "card-6", name: "6枚目", drawOrder: 6, placement: Object.freeze({ centerX: 2150, centerY: 650, width: 260, height: 442, rotation: 0 }) }),
      Object.freeze({ id: "card-7", name: "7枚目", drawOrder: 7, placement: Object.freeze({ centerX: 2500, centerY: 340, width: 260, height: 442, rotation: 0 }) }),
    ]),
  }),
  createChoiceSpreadDefinition(),
  Object.freeze({
    id: "hexagram",
    slug: "hexagram",
    name: "ヘキサグラム",
    names: Object.freeze({ ja: "ヘキサグラム", en: "Hexagram Spread" }),
    cardCount: 7,
    canvas: Object.freeze({ width: 2000, height: 1950 }),
    slots: Object.freeze([
      Object.freeze({ id: "card-1", name: "1枚目", drawOrder: 1, placement: Object.freeze({ centerX: 1000, centerY: 350, width: 242, height: 411, rotation: 0 }) }),
      Object.freeze({ id: "card-2", name: "2枚目", drawOrder: 2, placement: Object.freeze({ centerX: 1425, centerY: 1175, width: 242, height: 411, rotation: 0 }) }),
      Object.freeze({ id: "card-3", name: "3枚目", drawOrder: 3, placement: Object.freeze({ centerX: 575, centerY: 1175, width: 242, height: 411, rotation: 0 }) }),
      Object.freeze({ id: "card-4", name: "4枚目", drawOrder: 4, placement: Object.freeze({ centerX: 1000, centerY: 1450, width: 242, height: 411, rotation: 0 }) }),
      Object.freeze({ id: "card-5", name: "5枚目", drawOrder: 5, placement: Object.freeze({ centerX: 575, centerY: 625, width: 242, height: 411, rotation: 0 }) }),
      Object.freeze({ id: "card-6", name: "6枚目", drawOrder: 6, placement: Object.freeze({ centerX: 1425, centerY: 625, width: 242, height: 411, rotation: 0 }) }),
      Object.freeze({ id: "card-7", name: "7枚目", drawOrder: 7, placement: Object.freeze({ centerX: 1000, centerY: 900, width: 242, height: 411, rotation: 0 }) }),
    ]),
  }),
  Object.freeze({
    id: "celtic-cross",
    slug: "celtic-cross",
    name: "ケルト十字",
    names: Object.freeze({ ja: "ケルト十字", en: "Celtic Cross" }),
    cardCount: 10,
    canvas: Object.freeze({ width: 2900, height: 2100 }),
    slots: Object.freeze([
      Object.freeze({
        id: "card-1",
        name: "1枚目",
        drawOrder: 10,
        placement: Object.freeze({ centerX: 900, centerY: 1000, width: 231, height: 393, rotation: 0 }),
        caption: Object.freeze({ centerX: 900, y: 1235, maxWidth: 330 }),
      }),
      Object.freeze({
        id: "card-2",
        name: "2枚目",
        drawOrder: 20,
        placement: Object.freeze({ centerX: 900, centerY: 1000, width: 231, height: 393, rotation: -90 }),
        caption: Object.freeze({ x: 1109, y: 1133, maxWidth: 220, anchor: "left", wrapCardName: true }),
      }),
      Object.freeze({ id: "card-3", name: "3枚目", drawOrder: 30, placement: Object.freeze({ centerX: 900, centerY: 400, width: 231, height: 393, rotation: 0 }) }),
      Object.freeze({ id: "card-4", name: "4枚目", drawOrder: 40, placement: Object.freeze({ centerX: 900, centerY: 1600, width: 231, height: 393, rotation: 0 }) }),
      Object.freeze({ id: "card-5", name: "5枚目", drawOrder: 50, placement: Object.freeze({ centerX: 390, centerY: 1000, width: 231, height: 393, rotation: 0 }) }),
      Object.freeze({ id: "card-6", name: "6枚目", drawOrder: 60, placement: Object.freeze({ centerX: 1445, centerY: 1000, width: 231, height: 393, rotation: 0 }) }),
      Object.freeze({
        id: "card-7",
        name: "7枚目",
        drawOrder: 70,
        placement: Object.freeze({ centerX: 2100, centerY: 1670, width: 231, height: 393, rotation: 0 }),
        caption: Object.freeze({ x: 2236, y: 1670, maxWidth: 530, anchor: "left", verticalAnchor: "middle", wrapCardName: true }),
      }),
      Object.freeze({
        id: "card-8",
        name: "8枚目",
        drawOrder: 80,
        placement: Object.freeze({ centerX: 2100, centerY: 1250, width: 231, height: 393, rotation: 0 }),
        caption: Object.freeze({ x: 2236, y: 1250, maxWidth: 530, anchor: "left", verticalAnchor: "middle", wrapCardName: true }),
      }),
      Object.freeze({
        id: "card-9",
        name: "9枚目",
        drawOrder: 90,
        placement: Object.freeze({ centerX: 2100, centerY: 830, width: 231, height: 393, rotation: 0 }),
        caption: Object.freeze({ x: 2236, y: 830, maxWidth: 530, anchor: "left", verticalAnchor: "middle", wrapCardName: true }),
      }),
      Object.freeze({
        id: "card-10",
        name: "10枚目",
        drawOrder: 100,
        placement: Object.freeze({ centerX: 2100, centerY: 410, width: 231, height: 393, rotation: 0 }),
        caption: Object.freeze({ x: 2236, y: 410, maxWidth: 530, anchor: "left", verticalAnchor: "middle", wrapCardName: true }),
      }),
    ]),
  }),
]);

export function getSpreadById(id, choiceSettings = CHOICE_SPREAD_DEFAULTS) {
  if (id === "choice-spread") return createChoiceSpreadDefinition(choiceSettings);
  return SPREADS.find((spread) => spread.id === id) ?? SPREADS[0];
}

export function getSpreadName(spread, language = "ja") {
  return spread.names?.[language] ?? spread.name;
}
