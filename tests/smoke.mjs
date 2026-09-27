import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  CARD_MASTER,
  DEFAULT_CARD_NAME_DISPLAY,
  filterCards,
  formatCardName,
  getCardNameSettingAvailability,
  validateCardMaster,
} from "../js/data/cards.js";
import {
  CHOICE_SPREAD_DEFAULTS,
  createChoiceSpreadDefinition,
  getSpreadById,
  SPREADS,
} from "../js/data/spreads.js";
import { PRESET_THEMES } from "../js/data/themes.js";
import { getImageCoverSource, getSceneLayout, renderReading } from "../js/canvas/renderer.js";
import { loadImage } from "../js/services/asset-loader.js";
import { loadBackgroundImage } from "../js/services/background-repository.js";
import { createInitialReadingState, createReadingStore } from "../js/state/store.js";
import { createTimestamp, formatReadingDate } from "../js/utils/date.js";
import { sanitizeFilenameBase } from "../js/utils/text.js";
import { createRandomCardLayout, shuffleCards } from "../js/utils/random.js";
import { getRectangleOverlapRatio, shouldReleaseDraggedCard } from "../js/interactions/drag-and-drop.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isDeployRelativePath = (value) => (
  typeof value === "string"
  && !value.startsWith("/")
  && !value.startsWith("\\")
  && !/^[a-z][a-z\d+.-]*:/i.test(value)
);

assert.equal(validateCardMaster().length, 0, "Card Master validation failed");
assert.equal(CARD_MASTER.length, 78);
assert.equal(new Set(CARD_MASTER.map((card) => card.id)).size, 78);
assert.equal(filterCards("major").length, 22);
for (const suit of ["wands", "swords", "pentacles", "cups"]) {
  assert.equal(filterCards(suit).length, 14, `${suit} must contain 14 cards`);
}

await Promise.all(CARD_MASTER.flatMap((card) => [
  access(resolve(projectRoot, card.images.full)),
  access(resolve(projectRoot, card.images.thumbnail)),
]));
for (const card of CARD_MASTER) {
  assert.ok(isDeployRelativePath(card.images.full), `Full card path must be repository-relative: ${card.id}`);
  assert.ok(isDeployRelativePath(card.images.thumbnail), `Thumbnail path must be repository-relative: ${card.id}`);
}

const wandsAce = CARD_MASTER.find((card) => card.id === "wands_ace");
const wandsTwo = CARD_MASTER.find((card) => card.id === "wands_02");
const wandsKnight = CARD_MASTER.find((card) => card.id === "wands_knight");
assert.equal(formatCardName(wandsAce, DEFAULT_CARD_NAME_DISPLAY), "ワンド エース");
assert.equal(
  formatCardName(wandsAce, { ...DEFAULT_CARD_NAME_DISPLAY, aceStyle: "number", numberStyle: "arabic" }),
  "ワンド 1",
);
assert.equal(
  formatCardName(wandsAce, { ...DEFAULT_CARD_NAME_DISPLAY, aceStyle: "number", numberStyle: "roman" }),
  "ワンド I",
);
assert.equal(
  formatCardName(wandsAce, { ...DEFAULT_CARD_NAME_DISPLAY, aceStyle: "roman", numberStyle: "arabic" }),
  "ワンド 1",
  "Legacy Ace values must follow the shared number system",
);
assert.equal(formatCardName(wandsTwo, { ...DEFAULT_CARD_NAME_DISPLAY, suitStyle: "kanji", numberStyle: "roman" }), "棒 II");
assert.equal(formatCardName(wandsKnight, { ...DEFAULT_CARD_NAME_DISPLAY, courtStyle: "kanji" }), "ワンド 騎士");
assert.equal(formatCardName(wandsTwo, { ...DEFAULT_CARD_NAME_DISPLAY, language: "en" }), "Two of Wands");
const majorCard = CARD_MASTER.find((card) => card.id === "major_00");
const availability = getCardNameSettingAvailability(
  [majorCard, wandsAce, wandsTwo, wandsKnight],
  DEFAULT_CARD_NAME_DISPLAY,
  true,
);
assert.deepEqual(availability, { hasCards: true, suit: true, number: true, ace: true, court: true });
assert.equal(
  getCardNameSettingAvailability(
    [wandsAce],
    { ...DEFAULT_CARD_NAME_DISPLAY, aceStyle: "number" },
    true,
  ).number,
  true,
);
assert.equal(getCardNameSettingAvailability([wandsAce], DEFAULT_CARD_NAME_DISPLAY, true).number, false);
assert.deepEqual(
  getCardNameSettingAvailability([majorCard], DEFAULT_CARD_NAME_DISPLAY, true),
  { hasCards: true, suit: false, number: false, ace: false, court: false },
);
assert.equal(getCardNameSettingAvailability([wandsTwo], { ...DEFAULT_CARD_NAME_DISPLAY, language: "en" }, true).suit, false);
assert.equal(getCardNameSettingAvailability([wandsTwo], DEFAULT_CARD_NAME_DISPLAY, false).number, false);
assert.deepEqual(
  getCardNameSettingAvailability([], DEFAULT_CARD_NAME_DISPLAY, true),
  { hasCards: false, suit: false, number: false, ace: false, court: false },
);

assert.equal(SPREADS.length, 8);
assert.equal(new Set(SPREADS.map((spread) => spread.id)).size, 8);
for (const spread of SPREADS) {
  assert.ok(spread.name && spread.names.ja && spread.names.en && spread.canvas.width > 0 && spread.canvas.height > 0);
  assert.equal(new Set(spread.slots.map((slot) => slot.id)).size, spread.slots.length);
  assert.equal(spread.cardCount, spread.slots.length);
  for (const slot of spread.slots) {
    assert.ok(slot.placement.width > 0 && slot.placement.height > 0);
    assert.ok(Number.isFinite(slot.drawOrder));
  }
}

const celticSpread = getSpreadById("celtic-cross");
const celticLayout = getSceneLayout(
  { measureText: (value) => ({ width: String(value).length * 16 }) },
  celticSpread,
  createInitialReadingState(celticSpread),
);
const celticCenter = celticLayout.slots.find((slot) => slot.id === "card-1");
const celticCrossing = celticLayout.slots.find((slot) => slot.id === "card-2");
assert.equal(celticCrossing.rect.rotation, -90);
assert.ok(celticCrossing.drawOrder > celticCenter.drawOrder);
assert.equal(celticCenter.rect.width, 231);
assert.equal(celticSpread.slots.find((slot) => slot.id === "card-6").placement.centerX, 1445);
assert.equal(celticSpread.slots.find((slot) => slot.id === "card-7").placement.centerX, 2100);
assert.equal(celticSpread.slots.find((slot) => slot.id === "card-2").caption.x, 1109);

const hexagramSpread = getSpreadById("hexagram");
assert.ok(hexagramSpread.slots.every((slot) => slot.placement.width === 242));
assert.equal(hexagramSpread.slots.find((slot) => slot.id === "card-5").placement.centerX, 575);
assert.equal(hexagramSpread.slots.find((slot) => slot.id === "card-6").placement.centerX, 1425);
assert.ok(celticCrossing.hitRect.width > celticCrossing.hitRect.height);
assert.equal(celticCenter.captionLayout.centerX, celticCenter.rect.centerX);
assert.ok(celticCenter.captionLayout.y - (celticCenter.rect.y + celticCenter.rect.height) >= 32);
assert.ok(celticCenter.captionLayout.y - (celticCenter.rect.y + celticCenter.rect.height) <= 40);
assert.ok(celticCrossing.captionLayout.x - (celticCrossing.hitRect.x + celticCrossing.hitRect.width) >= 12);
assert.ok(celticCrossing.captionLayout.x - (celticCrossing.hitRect.x + celticCrossing.hitRect.width) <= 24);
assert.ok(celticCrossing.captionLayout.y - (celticCrossing.hitRect.y + celticCrossing.hitRect.height) >= 12);
assert.ok(celticCrossing.captionLayout.y - (celticCrossing.hitRect.y + celticCrossing.hitRect.height) <= 24);
assert.equal(celticCrossing.captionLayout.anchor, "left");
assert.equal(celticCrossing.captionLayout.wrapCardName, true);
assert.ok(celticCrossing.captionLayout.maxWidth >= 220);
const celticRightColumn = ["card-7", "card-8", "card-9", "card-10"]
  .map((slotId) => celticLayout.slots.find((slot) => slot.id === slotId));
for (const slot of celticRightColumn) {
  const captionGap = slot.captionLayout.x - (slot.hitRect.x + slot.hitRect.width);
  assert.ok(captionGap >= 16 && captionGap <= 24);
  assert.equal(slot.captionLayout.y, slot.rect.centerY);
  assert.equal(slot.captionLayout.anchor, "left");
  assert.equal(slot.captionLayout.verticalAnchor, "middle");
  assert.equal(slot.captionLayout.wrapCardName, true);
  assert.ok(slot.captionLayout.x + slot.captionLayout.maxWidth < celticSpread.canvas.width);
}

function createRecordingCanvas() {
  const text = [];
  const fonts = [];
  const textDraws = [];
  let fills = 0;
  let strokes = 0;
  const context = {
    setTransform() {},
    createLinearGradient() { return { addColorStop() {} }; },
    fillRect() {}, save() {}, restore() {}, beginPath() {}, moveTo() {}, arcTo() {}, closePath() {},
    fill() { fills += 1; }, stroke() { strokes += 1; }, translate() {}, rotate() {}, clip() {}, drawImage() {}, arc() {}, bezierCurveTo() {},
    measureText(value) { return { width: String(value).length * 14 }; },
    fillText(value, x, y) {
      text.push(String(value));
      fonts.push(this.font);
      textDraws.push({ text: String(value), x, y, textAlign: this.textAlign });
    },
    set font(value) { this._font = value; },
    get font() { return this._font ?? ""; },
  };
  return {
    canvas: { width: 0, height: 0, getContext: () => context },
    text,
    fonts,
    textDraws,
    get fills() { return fills; },
    get strokes() { return strokes; },
  };
}

const outputSpread = getSpreadById("one-oracle");
const outputState = createInitialReadingState(outputSpread);
outputState.slots["card-1"].cardId = "test-card";
outputState.cardNameDisplay.language = "en";
outputState.output.displayCardNames = false;
outputState.output.fontFamily = "mincho";
const recording = createRecordingCanvas();
await renderReading(recording.canvas, {
  spread: outputSpread,
  state: outputState,
  getCard: (id) => id ? { id, images: {} } : null,
  getCardName: () => "Ace of Wands",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
});
assert.ok(recording.text.includes("One-Card Spread"));
assert.ok(recording.text.includes("Upright"));
assert.ok(!recording.text.includes("Ace of Wands"));
assert.ok(recording.fonts.some((font) => font.includes("Yu Mincho")));

const noCardsEnglishState = createInitialReadingState(outputSpread);
noCardsEnglishState.cardNameDisplay.language = "en";
const noCardsEnglishRecording = createRecordingCanvas();
await renderReading(noCardsEnglishRecording.canvas, {
  spread: outputSpread,
  state: noCardsEnglishState,
  getCard: () => null,
  getCardName: () => "",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
});
assert.ok(noCardsEnglishRecording.text.includes("One-Card Spread"));

const fullCaptionState = structuredClone(outputState);
fullCaptionState.output.displayCardNames = true;
fullCaptionState.output.displayOrientations = true;
fullCaptionState.slots["card-1"].label = "Current";
const fullCaptionRecording = createRecordingCanvas();
await renderReading(fullCaptionRecording.canvas, {
  spread: outputSpread,
  state: fullCaptionState,
  getCard: (id) => id ? { id, images: {} } : null,
  getCardName: () => "Ace of Wands",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
});
assert.ok(!fullCaptionRecording.text.includes("Ace of Wands：Upright"));
assert.ok(fullCaptionRecording.text.includes("Current"));
assert.ok(fullCaptionRecording.text.includes("Ace of Wands"));
assert.ok(fullCaptionRecording.text.includes("Upright"));
assert.ok(fullCaptionRecording.text.indexOf("Current") < fullCaptionRecording.text.indexOf("Ace of Wands"));
assert.ok(fullCaptionRecording.text.indexOf("Ace of Wands") < fullCaptionRecording.text.indexOf("Upright"));
const fullCaptionDraws = fullCaptionRecording.textDraws.filter(({ text }) => ["Current", "Ace of Wands", "Upright"].includes(text));
assert.deepEqual(fullCaptionDraws.map(({ y }) => y), [fullCaptionDraws[0].y, fullCaptionDraws[0].y + 38, fullCaptionDraws[0].y + 76]);
assert.ok(fullCaptionRecording.fonts.some((font) => font.includes("36px")), "role text should use the enlarged hierarchy");
assert.ok(fullCaptionRecording.fonts.some((font) => font.includes("34px")), "card names should use the enlarged hierarchy");

for (const crossingName of ["The High Priestess", "Wheel of Fortune", "Three of Pentacles"]) {
  const celticCaptionState = createInitialReadingState(celticSpread);
  celticCaptionState.cardNameDisplay.language = "en";
  celticCaptionState.slots["card-1"] = { cardId: "center", reversed: false, label: "Present" };
  celticCaptionState.slots["card-2"] = { cardId: "crossing", reversed: false, label: "Crossing" };
  const celticCaptionRecording = createRecordingCanvas();
  await renderReading(celticCaptionRecording.canvas, {
    spread: celticSpread,
    state: celticCaptionState,
    getCard: (id) => id ? { id, images: {} } : null,
    getCardName: (card) => card ? (card.id === "center" ? "The High Priestess" : crossingName) : "",
    branding: { serviceName: "Tarot Spread Canvas", url: "" },
  });
  const crossingDraws = celticCaptionRecording.textDraws.filter(({ x }) => x === celticCrossing.captionLayout.x);
  assert.equal(crossingDraws[0].text, "Crossing");
  assert.equal(crossingDraws.at(-1).text, "Upright");
  assert.ok(crossingDraws.every(({ textAlign }) => textAlign === "left"));
  assert.equal(crossingDraws.slice(1, -1).map(({ text }) => text).join(" ").replace(/\s+/g, " "), crossingName);
  assert.ok(crossingDraws.length <= 4, "card name may use at most two lines");
}

const rightColumnCaptionState = createInitialReadingState(celticSpread);
rightColumnCaptionState.cardNameDisplay.language = "en";
rightColumnCaptionState.slots["card-7"] = { cardId: "right-column", reversed: false, label: "Outcome" };
const rightColumnCaptionRecording = createRecordingCanvas();
await renderReading(rightColumnCaptionRecording.canvas, {
  spread: celticSpread,
  state: rightColumnCaptionState,
  getCard: (id) => id ? { id, images: {} } : null,
  getCardName: (card) => card ? "Three of Pentacles" : "",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
});
const rightColumnSlot = celticLayout.slots.find((slot) => slot.id === "card-7");
const rightColumnDraws = rightColumnCaptionRecording.textDraws
  .filter(({ x }) => x === rightColumnSlot.captionLayout.x);
assert.deepEqual(rightColumnDraws.map(({ text }) => text), ["Outcome", "Three of Pentacles", "Upright"]);
assert.ok(rightColumnDraws.every(({ textAlign }) => textAlign === "left"));
assert.deepEqual(
  rightColumnDraws.map(({ y }) => y),
  [rightColumnSlot.rect.centerY - 38, rightColumnSlot.rect.centerY, rightColumnSlot.rect.centerY + 38],
);

const nameOnlyState = structuredClone(outputState);
nameOnlyState.output.displayCardNames = true;
nameOnlyState.output.displayOrientations = false;
const nameOnlyRecording = createRecordingCanvas();
await renderReading(nameOnlyRecording.canvas, {
  spread: outputSpread,
  state: nameOnlyState,
  getCard: (id) => id ? { id, images: {} } : null,
  getCardName: () => "Ace of Wands",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
});
assert.ok(nameOnlyRecording.text.includes("Ace of Wands"));
assert.ok(!nameOnlyRecording.text.includes("Upright"));

const noCaptionState = structuredClone(outputState);
noCaptionState.output.displayCardNames = false;
noCaptionState.output.displayOrientations = false;
const noCaptionRecording = createRecordingCanvas();
await renderReading(noCaptionRecording.canvas, {
  spread: outputSpread,
  state: noCaptionState,
  getCard: (id) => id ? { id, images: {} } : null,
  getCardName: () => "Ace of Wands",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
});
assert.ok(!noCaptionRecording.text.includes("Ace of Wands"));
assert.ok(!noCaptionRecording.text.includes("Upright"));

const emptyOutputState = createInitialReadingState(outputSpread);
emptyOutputState.slots["card-1"].label = "Remembered role";
const emptyOutputRecording = createRecordingCanvas();
await renderReading(emptyOutputRecording.canvas, {
  spread: outputSpread,
  state: emptyOutputState,
  getCard: () => null,
  getCardName: () => "",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
  mode: "output",
});
const emptyEditorRecording = createRecordingCanvas();
await renderReading(emptyEditorRecording.canvas, {
  spread: outputSpread,
  state: emptyOutputState,
  getCard: () => null,
  getCardName: () => "",
  branding: { serviceName: "Tarot Spread Canvas", url: "" },
  mode: "editor",
});
assert.ok(!emptyOutputRecording.text.includes("カードを選択"));
assert.ok(emptyOutputRecording.text.includes("Remembered role"));
assert.ok(emptyEditorRecording.text.includes("カードを選択"));
assert.ok(emptyEditorRecording.text.includes("Remembered role"));
assert.ok(emptyOutputRecording.strokes > 0, "output mode should draw the empty slot frame");
assert.equal(emptyEditorRecording.strokes, emptyOutputRecording.strokes);

for (const theme of PRESET_THEMES.filter((item) => item.type === "programmatic")) {
  const themedEmptyState = structuredClone(emptyOutputState);
  themedEmptyState.background.presetId = theme.id;
  const themedEmptyRecording = createRecordingCanvas();
  await renderReading(themedEmptyRecording.canvas, {
    spread: outputSpread,
    state: themedEmptyState,
    getCard: () => null,
    getCardName: () => "",
    branding: { serviceName: "Tarot Spread Canvas", url: "" },
    mode: "output",
  });
  assert.ok(themedEmptyRecording.strokes > 0, `${theme.name} should draw the empty slot frame`);
  assert.ok(!themedEmptyRecording.text.includes("カードを選択"));
}

const shownTitleLayout = getSceneLayout(recording.canvas.getContext("2d"), outputSpread, {
  ...outputState,
  output: { ...outputState.output, displaySpreadName: true },
});
const hiddenTitleLayout = getSceneLayout(recording.canvas.getContext("2d"), outputSpread, {
  ...outputState,
  output: { ...outputState.output, displaySpreadName: false },
});
assert.ok(hiddenTitleLayout.slots[0].rect.centerY < shownTitleLayout.slots[0].rect.centerY);

for (const optionCount of [2, 3, 4]) {
  const withoutCommon = createChoiceSpreadDefinition({ optionCount, commonEnabled: false });
  const withCommon = createChoiceSpreadDefinition({ optionCount, commonEnabled: true });
  assert.equal(withoutCommon.slots.length, optionCount * 2);
  assert.equal(withCommon.slots.length, optionCount * 2 + 1);
  assert.equal(withoutCommon.groups.length, optionCount);
  assert.equal(withCommon.slots[0].id, "common");
  assert.ok(withCommon.slots.find((slot) => slot.id === "common").placement.centerY
    > withCommon.slots.find((slot) => slot.id === "option-1-card-1").placement.centerY);
  assert.ok(withCommon.slots.find((slot) => slot.id === "option-1-card-2").placement.centerY
    < withCommon.slots.find((slot) => slot.id === "option-1-card-1").placement.centerY);
}
assert.equal(CHOICE_SPREAD_DEFAULTS.commonEnabled, true);

const horseshoe = getSpreadById("horseshoe");
assert.deepEqual(
  horseshoe.slots.map((slot) => slot.placement.centerY),
  [340, 650, 850, 950, 850, 650, 340],
);

const initialSpread = getSpreadById("three-card");
const store = createReadingStore(createInitialReadingState(initialSpread));
assert.equal(store.getState().background.presetId, "light");
assert.equal(store.getState().choiceSpread.commonEnabled, true);
assert.deepEqual(store.getState().output, {
  displaySpreadName: true,
  displayCardNames: true,
  displayOrientations: true,
  fontFamily: "gothic",
});
store.setOutput({ displayCardNames: false, fontFamily: "mincho" });
assert.equal(store.getState().output.displayCardNames, false);
assert.equal(store.getState().output.fontFamily, "mincho");
store.setSlotLabel("card-1", "現状");
store.setSlotLabel("card-2", "対策");
store.setCard("card-1", "wands_02");
store.toggleReversed("card-1");
assert.equal(store.setCard("card-2", "wands_02"), false, "duplicate cards must be rejected by state");
assert.equal(store.getState().slots["card-2"].cardId, null);
store.setCard("card-2", "wands_knight");
store.moveCard("card-1", "card-2");
assert.deepEqual(store.getState().slots["card-1"], {
  cardId: "wands_knight",
  reversed: false,
  label: "現状",
});
assert.deepEqual(store.getState().slots["card-2"], {
  cardId: "wands_02",
  reversed: true,
  label: "対策",
});

const batchStore = createReadingStore(createInitialReadingState(initialSpread));
batchStore.setSlotLabel("card-1", "維持する役割");
assert.equal(batchStore.replaceCardLayout({
  "card-1": { cardId: "major_00", reversed: true },
  "card-2": { cardId: "major_01", reversed: false },
  "card-3": { cardId: "major_02", reversed: true },
}), true);
assert.equal(batchStore.getState().slots["card-1"].label, "維持する役割");
assert.equal(batchStore.getState().slots["card-1"].reversed, true);
const batchStateBeforeClear = batchStore.getState();
assert.equal(batchStore.clearCards(["card-1", "card-2"]), true);
assert.deepEqual(batchStore.getState().slots["card-1"], {
  cardId: null,
  reversed: false,
  label: "維持する役割",
});
assert.equal(batchStore.getState().slots["card-2"].cardId, null);
assert.equal(batchStore.getState().slots["card-3"].cardId, "major_02", "inactive slots must not be cleared");
assert.equal(batchStore.getState().question, batchStateBeforeClear.question);
assert.equal(batchStore.clearCards(["card-1", "card-2"]), false, "clearing empty active slots must be a no-op");
batchStore.replaceCardLayout({
  "card-1": { cardId: "major_00", reversed: true },
  "card-2": { cardId: "major_01", reversed: false },
});
const batchSnapshot = structuredClone(batchStore.getState().slots);
assert.equal(batchStore.replaceCardLayout({
  "card-1": { cardId: "major_03", reversed: false },
  "card-2": { cardId: "major_03", reversed: true },
}), false, "duplicate batch layouts must be rejected");
assert.deepEqual(batchStore.getState().slots, batchSnapshot);

const deterministicShuffle = shuffleCards(CARD_MASTER.slice(0, 10), () => 0);
assert.equal(new Set(deterministicShuffle.map((card) => card.id)).size, 10);
const automaticLayout = createRandomCardLayout(CARD_MASTER, initialSpread.slots.map((slot) => slot.id), {
  includeReversed: true,
  randomInt: (maxExclusive) => maxExclusive - 1,
});
assert.equal(Object.keys(automaticLayout).length, 3);
assert.equal(new Set(Object.values(automaticLayout).map(({ cardId }) => cardId)).size, 3);
assert.ok(Object.values(automaticLayout).every(({ reversed }) => reversed));
const uprightLayout = createRandomCardLayout(CARD_MASTER, initialSpread.slots.map((slot) => slot.id), {
  includeReversed: false,
  randomInt: () => 0,
});
assert.ok(Object.values(uprightLayout).every(({ reversed }) => !reversed));
store.removeCard("card-2");
assert.deepEqual(store.getState().slots["card-2"], {
  cardId: null,
  reversed: false,
  label: "対策",
});

const choice = createChoiceSpreadDefinition(CHOICE_SPREAD_DEFAULTS);
const choiceStore = createReadingStore(createInitialReadingState(choice));
choiceStore.setGroupLabel("option-1", "転職する");
choiceStore.setCard("option-1-card-1", "wands_02");
const expandedChoice = createChoiceSpreadDefinition({ optionCount: 4, commonEnabled: true });
choiceStore.configureChoiceSpread(expandedChoice, expandedChoice.settings);
assert.equal(choiceStore.getState().groupLabels["option-1"], "転職する");
assert.equal(choiceStore.getState().slots["option-1-card-1"].cardId, "wands_02");
assert.ok(choiceStore.getState().slots.common);

assert.equal(formatReadingDate({ enabled: false, mode: "single", single: "2026-09-25" }), "");
assert.equal(formatReadingDate({ enabled: true, mode: "range", start: "2026-09-01", end: "2026-09-30" }), "2026/09/01 ～ 2026/09/30");
assert.equal(createTimestamp(new Date(2026, 8, 25, 11, 5)), "20260925-1105");
assert.equal(sanitizeFilenameBase('bad<>:"/\\|?* name.', "fallback"), "bad--------- name");
assert.equal(sanitizeFilenameBase("   ", "fallback"), "fallback");

const originalRect = { left: 100, top: 100, right: 300, bottom: 400, width: 200, height: 300 };
assert.equal(getRectangleOverlapRatio(originalRect, originalRect), 1);
assert.equal(shouldReleaseDraggedCard({ sourceRect: originalRect, clientX: 200, clientY: 250, viewportWidth: 1200, viewportHeight: 900 }), false);
assert.equal(shouldReleaseDraggedCard({ sourceRect: originalRect, clientX: 410, clientY: 250, viewportWidth: 1200, viewportHeight: 900 }), true);
assert.equal(shouldReleaseDraggedCard({ sourceRect: originalRect, clientX: 0, clientY: 0, viewportWidth: 1200, viewportHeight: 900 }), false);

assert.deepEqual(PRESET_THEMES.map((theme) => theme.id), ["light", "dark", "purple", "malachite", "cosmic", "wood"]);
assert.equal(PRESET_THEMES.find((theme) => theme.id === "purple").name, "Elegance");
assert.equal(PRESET_THEMES.find((theme) => theme.id === "light").colors.text, "#352d24");
assert.ok(PRESET_THEMES.every((theme) => !("ui" in theme)), "Canvas themes must not carry GUI colors");
for (const theme of PRESET_THEMES.filter((item) => item.type === "image")) {
  assert.ok(isDeployRelativePath(theme.source), `Background path must be repository-relative: ${theme.id}`);
  await access(resolve(projectRoot, theme.source.replace(/^\.\//, "").replace(/\?.*$/, "")));
}

for (const [imageWidth, imageHeight, canvasWidth, canvasHeight] of [
  [1448, 1086, 1200, 1000],
  [1448, 1086, 1050, 1500],
  [1292, 1218, 2900, 2100],
]) {
  const source = getImageCoverSource(imageWidth, imageHeight, canvasWidth, canvasHeight);
  assert.ok(source.sourceX >= 0 && source.sourceY >= 0);
  assert.ok(source.sourceWidth <= imageWidth && source.sourceHeight <= imageHeight);
  assert.ok(Math.abs((source.sourceWidth / source.sourceHeight) - (canvasWidth / canvasHeight)) < 1e-9);
}

let fakeImageCreations = 0;
globalThis.Image = class FakeImage {
  set src(_value) {
    fakeImageCreations += 1;
    queueMicrotask(() => this.onerror?.());
  }
};
assert.equal(await loadBackgroundImage("missing-background.webp"), null);
assert.equal(await loadBackgroundImage("missing-background.webp"), null);
await assert.rejects(loadImage("missing-card.jpg"));
await assert.rejects(loadImage("missing-card.jpg"));
assert.equal(fakeImageCreations, 2, "failed image requests must also be cached");
delete globalThis.Image;

const html = await readFile(resolve(projectRoot, "index.html"), "utf8");
const appSource = await readFile(resolve(projectRoot, "js/app.js"), "utf8");
const cssSource = await readFile(resolve(projectRoot, "css/style.css"), "utf8");
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const referencedIds = [...appSource.matchAll(/getElementById\("([^"]+)"\)/g)].map((match) => match[1]);
for (const id of referencedIds) {
  assert.ok(htmlIds.has(id), `Missing DOM element: #${id}`);
}
assert.match(cssSource, /@media \(prefers-color-scheme: dark\)/);
assert.match(cssSource, /:root\s*\{[\s\S]*?color-scheme:\s*light;/);
assert.match(cssSource, /@media \(prefers-color-scheme: dark\)[\s\S]*?color-scheme:\s*dark;/);
assert.doesNotMatch(`${html}\n${cssSource}`, /theme-linked-input|--editor-(?:surface|border|text|placeholder)/);
assert.doesNotMatch(appSource, /applyEditorTheme|resolveBackgroundTheme/);
assert.match(html, /<section id="cardNamePanel" class="card-name-panel" aria-labelledby="cardNamePanelTitle">/);
assert.match(html, /<legend>数字体系<\/legend>/);
assert.match(html, /<legend>エース<\/legend>/);
assert.match(html, /<legend>コート<\/legend>/);
assert.equal((html.match(/name="aceStyle"/g) ?? []).length, 2);
assert.match(html, /name="aceStyle" value="number"> 数字/);
assert.match(html, /name="courtStyle" value="kana" checked> カナ/);
assert.match(html, /name="courtStyle" value="kanji"> 漢字/);
assert.match(html, /<section class="output-settings"[\s\S]*?<legend>出力言語<\/legend>/);
assert.match(html, /id="autoPlaceCards"[^>]*>カードを配置<\/button>/);
assert.match(html, /id="removeAllCards"[^>]*disabled>カードをすべて外す<\/button>/);
assert.match(html, /id="includeReversed"[^>]*checked/);
assert.doesNotMatch(html, /100%表示|実寸確認|実寸表示/);
assert.match(cssSource, /\.image-preview-stage[^}]*overflow:\s*hidden/);
assert.match(cssSource, /#fullSizePreviewCanvas[^}]*max-width:\s*100%[^}]*max-height:\s*100%/);
assert.match(appSource, /button\.disabled = isPlaced/);
assert.match(html, /id="helpDialog"[^>]*aria-labelledby="helpTitle"/);
assert.match(html, /<h1 class="app-brand">TAROT SPREAD CANVAS<\/h1>/);
assert.doesNotMatch(html, /<h1[^>]*>タロット・スプレッド<\/h1>/);
assert.match(html, /role="tablist"[^>]*aria-label="ヘルプの内容"/);
assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 3);
assert.equal((html.match(/<details>/g) ?? []).length, 9);
assert.equal((html.match(/data-help-section=/g) ?? []).length, 3);
assert.match(html, /Rider–Waite–Smith Tarot/);
assert.match(appSource, /keepFocusInsideDialog\(event, elements\.helpDialog\)/);
assert.match(appSource, /helpReturnFocus/);
assert.match(appSource, /textarea:not\(\[disabled\]\), summary, a\[href\]/);
assert.match(cssSource, /\.help-dialog::backdrop/);
assert.match(cssSource, /\.help-tabs\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3/);
const appConfigSource = await readFile(resolve(projectRoot, "js/data/app-config.js"), "utf8");
assert.match(appConfigSource, /copyright:\s*"© 2026 Suguru Mantic Works"/);
assert.doesNotMatch(`${html}\n${appSource}`, /https?:\/\//);
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  assert.ok(isDeployRelativePath(match[1]), `HTML asset path must be repository-relative: ${match[1]}`);
}

console.log("Smoke checks passed: cards, assets, spreads, state, names, output, drag release, dates, filenames, themes, cover, caches, DOM IDs");
