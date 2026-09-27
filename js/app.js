import { APP_CONFIG } from "./data/app-config.js?v=1.0.0-rc17";
import { CARD_FILTERS, getCardNameSettingAvailability } from "./data/cards.js?v=1.0.0-rc10";
import { PRESET_THEMES, SOLID_COLORS } from "./data/themes.js?v=1.0.0-rc10";
import {
  createChoiceSpreadDefinition,
  getSpreadById,
  getSpreadName,
  SPREADS,
} from "./data/spreads.js?v=1.0.0-rc13";
import { renderReading } from "./canvas/renderer.js?v=1.0.0-rc14";
import { createInitialReadingState, createReadingStore } from "./state/store.js?v=1.0.0-rc13";
import { getCard, getCardName, getCards } from "./services/card-repository.js?v=1.0.0-rc10";
import { exportReadingImage } from "./services/exporter.js?v=1.0.0-rc13";
import { createTimestamp } from "./utils/date.js";
import { createRandomCardLayout } from "./utils/random.js?v=1.0.0-rc13";
import { createDragController } from "./interactions/drag-and-drop.js";

const elements = {
  spreadSelect: document.getElementById("spreadSelect"),
  choiceSpreadControls: document.getElementById("choiceSpreadControls"),
  choiceCommonEnabled: document.getElementById("choiceCommonEnabled"),
  includeReversed: document.getElementById("includeReversed"),
  autoPlaceCards: document.getElementById("autoPlaceCards"),
  removeAllCards: document.getElementById("removeAllCards"),
  autoPlaceStatus: document.getElementById("autoPlaceStatus"),
  previewTitle: document.getElementById("previewTitle"),
  previewStatus: document.getElementById("previewStatus"),
  stage: document.getElementById("stage"),
  sceneLayer: document.getElementById("sceneLayer"),
  canvas: document.getElementById("spreadCanvas"),
  exportPreviewCanvas: document.getElementById("exportPreviewCanvas"),
  openImagePreview: document.getElementById("openImagePreview"),
  imagePreviewDialog: document.getElementById("imagePreviewDialog"),
  closeImagePreview: document.getElementById("closeImagePreview"),
  fullSizePreviewCanvas: document.getElementById("fullSizePreviewCanvas"),
  slotOverlay: document.getElementById("slotOverlay"),
  choiceNameFields: document.getElementById("choiceNameFields"),
  selectedSlotText: document.getElementById("selectedSlotText"),
  selectedRoleInput: document.getElementById("selectedRoleInput"),
  replaceCardButton: document.getElementById("replaceCardButton"),
  toggleOrientationButton: document.getElementById("toggleOrientationButton"),
  removeCardButton: document.getElementById("removeCardButton"),
  questionInput: document.getElementById("questionInput"),
  dateEnabled: document.getElementById("dateEnabled"),
  dateOptions: document.getElementById("dateOptions"),
  singleDateField: document.getElementById("singleDateField"),
  singleDateInput: document.getElementById("singleDateInput"),
  rangeDateFields: document.getElementById("rangeDateFields"),
  startDateInput: document.getElementById("startDateInput"),
  endDateInput: document.getElementById("endDateInput"),
  presetBackgrounds: document.getElementById("presetBackgrounds"),
  solidBackgrounds: document.getElementById("solidBackgrounds"),
  solidSwatches: document.getElementById("solidSwatches"),
  customColorInput: document.getElementById("customColorInput"),
  cardNameSettingsNote: document.getElementById("cardNameSettingsNote"),
  suitStyleFieldset: document.getElementById("suitStyleFieldset"),
  numberStyleFieldset: document.getElementById("numberStyleFieldset"),
  aceStyleFieldset: document.getElementById("aceStyleFieldset"),
  courtStyleFieldset: document.getElementById("courtStyleFieldset"),
  showSpreadName: document.getElementById("showSpreadName"),
  showCardNames: document.getElementById("showCardNames"),
  showOrientations: document.getElementById("showOrientations"),
  cardPickerDialog: document.getElementById("cardPickerDialog"),
  cardPickerTarget: document.getElementById("cardPickerTarget"),
  closeCardPicker: document.getElementById("closeCardPicker"),
  cardFilters: document.getElementById("cardFilters"),
  cardResultCount: document.getElementById("cardResultCount"),
  cardGrid: document.getElementById("cardGrid"),
  saveCard: document.getElementById("saveCard"),
  jpegQualityField: document.getElementById("jpegQualityField"),
  jpegQuality: document.getElementById("jpegQuality"),
  jpegQualityOutput: document.getElementById("jpegQualityOutput"),
  filenameInput: document.getElementById("filenameInput"),
  standardExportSize: document.getElementById("standardExportSize"),
  highExportSize: document.getElementById("highExportSize"),
  saveStatus: document.getElementById("saveStatus"),
  saveImageButton: document.getElementById("saveImageButton"),
  openHelp: document.getElementById("openHelp"),
  helpDialog: document.getElementById("helpDialog"),
  closeHelp: document.getElementById("closeHelp"),
  footerCopyright: document.getElementById("footerCopyright"),
  aboutCopyright: document.getElementById("aboutCopyright"),
};

let spread = getSpreadById("two-oracle");
const store = createReadingStore(createInitialReadingState(spread));
let selectedSlotId = spread.slots[0].id;
let activeCardFilter = "all";
let renderRevision = 0;
let renderFrame = 0;
let pendingRenderState = store.getState();
let thumbnailObserver = null;
let cardPickerReturnFocus = null;
let helpReturnFocus = null;
let filenameEdited = false;
const desktopDragQuery = window.matchMedia("(min-width: 641px) and (hover: hover) and (pointer: fine)");

function canUseDragAndDrop() {
  return desktopDragQuery.matches;
}

const dragController = createDragController({
  isEnabled: canUseDragAndDrop,
  onDropCard(cardId, slotId) {
    selectedSlotId = slotId;
    if (store.setCard(slotId, cardId) && elements.cardPickerDialog.open) {
      elements.cardPickerDialog.close();
    }
  },
  onMoveCard(fromSlotId, toSlotId) {
    selectedSlotId = toSlotId;
    store.moveCard(fromSlotId, toSlotId);
  },
  onReleaseCard(slotId) {
    selectedSlotId = slotId;
    store.removeCard(slotId);
  },
  onDragStateChange(isDragging) {
    document.body.classList.toggle("is-dragging-card", isDragging);
  },
});

function renderSpreadOptions() {
  elements.spreadSelect.replaceChildren(...SPREADS.map((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = getSpreadName(item, "ja");
    return option;
  }));
  elements.spreadSelect.value = spread.id;
}

function updateSpreadLanguageUi(state) {
  const displayName = getSpreadName(spread, state.cardNameDisplay.language);
  elements.previewTitle.textContent = displayName;
  elements.canvas.setAttribute("aria-label", `${displayName}の編集プレビュー`);
}

function updateSpreadUi(state) {
  elements.spreadSelect.value = spread.id;
  updateSpreadLanguageUi(state);
  const spreadRatio = spread.canvas.width / spread.canvas.height;
  elements.sceneLayer.style.aspectRatio = `${spread.canvas.width} / ${spread.canvas.height}`;
  elements.sceneLayer.classList.toggle("is-wide", spreadRatio >= 16 / 9);
  elements.sceneLayer.classList.toggle("is-tall", spreadRatio < 16 / 9);
  elements.exportPreviewCanvas.parentElement.style.aspectRatio = `${spread.canvas.width} / ${spread.canvas.height}`;
  elements.standardExportSize.textContent = `${spread.canvas.width} × ${spread.canvas.height}`;
  elements.highExportSize.textContent = `${spread.canvas.width * APP_CONFIG.export.highResolutionScale} × ${spread.canvas.height * APP_CONFIG.export.highResolutionScale}`;
  elements.choiceSpreadControls.hidden = spread.kind !== "choice";
  elements.autoPlaceStatus.textContent = "";
  if (!filenameEdited) elements.filenameInput.value = buildAutomaticFilename();
  updateCardActions(state);
}

function getDiscardedCardCount(currentSpread, nextSpread, state) {
  return currentSpread.slots
    .slice(nextSpread.slots.length)
    .filter((slot) => state.slots[slot.id]?.cardId)
    .length;
}

function changeSpread(nextSpreadId) {
  const state = store.getState();
  const nextSpread = getSpreadById(nextSpreadId, state.choiceSpread);
  if (nextSpread.id === spread.id) return;
  const discardedCardCount = getDiscardedCardCount(spread, nextSpread, state);
  if (discardedCardCount > 0 && !window.confirm(`スプレッドを変更すると、配置済みカード${discardedCardCount}枚が外れます。変更しますか？`)) {
    elements.spreadSelect.value = spread.id;
    return;
  }
  const currentSpread = spread;
  spread = nextSpread;
  selectedSlotId = spread.slots[0].id;
  filenameEdited = false;
  store.setSpread(currentSpread, nextSpread);
  updateSpreadUi(store.getState());
}

function getRemovedChoiceCardCount(currentSpread, nextSpread, state) {
  const nextSlotIds = new Set(nextSpread.slots.map((slot) => slot.id));
  return currentSpread.slots.filter((slot) => !nextSlotIds.has(slot.id) && state.slots[slot.id]?.cardId).length;
}

function changeChoiceSpreadSettings(patch) {
  if (spread.kind !== "choice") return;
  const state = store.getState();
  const nextSettings = { ...state.choiceSpread, ...patch };
  const nextSpread = createChoiceSpreadDefinition(nextSettings);
  const discardedCardCount = getRemovedChoiceCardCount(spread, nextSpread, state);
  if (discardedCardCount > 0 && !window.confirm(`設定を変更すると、配置済みカード${discardedCardCount}枚が外れます。変更しますか？`)) {
    syncControls(state);
    return;
  }
  spread = nextSpread;
  if (!spread.slots.some((slot) => slot.id === selectedSlotId)) selectedSlotId = spread.slots[0].id;
  store.configureChoiceSpread(spread, nextSettings);
  updateSpreadUi(store.getState());
}

function renderThemeControls() {
  elements.presetBackgrounds.replaceChildren(...PRESET_THEMES.map((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-option";
    button.dataset.themeId = theme.id;
    const preview = document.createElement("span");
    preview.className = "theme-option-preview";
    preview.style.background = theme.preview;
    preview.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.textContent = theme.name;
    button.append(preview, name);
    button.addEventListener("click", () => store.setBackground({ mode: "preset", presetId: theme.id }));
    return button;
  }));

  elements.solidSwatches.replaceChildren(...SOLID_COLORS.map((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.dataset.color = color.value;
    button.style.background = color.value;
    button.title = color.name;
    button.setAttribute("aria-label", color.name);
    button.addEventListener("click", () => {
      elements.customColorInput.value = color.value;
      store.setBackground({ mode: "solid", solidColor: color.value });
    });
    return button;
  }));
}

function renderCardFilters() {
  elements.cardFilters.replaceChildren(...CARD_FILTERS.map((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card-filter-button";
    button.dataset.filterId = filter.id;
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", String(filter.id === activeCardFilter));
    button.addEventListener("click", () => {
      activeCardFilter = filter.id;
      renderCardFilters();
      renderCardGrid(store.getState());
      elements.cardFilters.querySelector(`[data-filter-id="${filter.id}"]`)?.focus();
    });
    return button;
  }));
}

function createCardChoice(card, state) {
  const cardName = getCardName(card, state.cardNameDisplay);
  const isPlaced = Object.values(state.slots).some((slot) => slot.cardId === card.id);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-choice";
  button.dataset.cardId = card.id;
  button.disabled = isPlaced;
  button.setAttribute("aria-label", isPlaced ? `${cardName}（配置済み）` : `${cardName}を選択`);
  const imageFrame = document.createElement("span");
  imageFrame.className = "card-thumbnail-frame";
  const image = document.createElement("img");
  image.className = "card-thumbnail";
  image.draggable = false;
  image.dataset.src = card.images.thumbnail;
  image.alt = "";
  image.decoding = "async";
  const fallback = document.createElement("span");
  fallback.className = "card-image-fallback";
  fallback.textContent = "画像を読み込めません";
  fallback.hidden = true;
  image.addEventListener("error", () => {
    image.hidden = true;
    fallback.hidden = false;
  }, { once: true });
  imageFrame.append(image, fallback);
  const name = document.createElement("span");
  name.className = "card-name";
  name.textContent = cardName;
  button.append(imageFrame, name);
  if (isPlaced) {
    const status = document.createElement("span");
    status.className = "card-choice-status";
    status.textContent = "配置済み";
    button.append(status);
    button.draggable = false;
  } else {
    button.addEventListener("click", () => {
      if (dragController.shouldSuppressClick()) return;
      if (store.setCard(selectedSlotId, card.id)) elements.cardPickerDialog.close();
    });
    dragController.attachCardChoice(button, card.id);
  }
  return button;
}

function placeCardsAutomatically() {
  const state = store.getState();
  const hasPlacedCards = spread.slots.some((slot) => state.slots[slot.id]?.cardId);
  if (hasPlacedCards && !window.confirm("現在のカード配置を置き換えますか？")) return;

  const layout = createRandomCardLayout(
    getCards("all"),
    spread.slots.map((slot) => slot.id),
    { includeReversed: elements.includeReversed.checked },
  );
  selectedSlotId = spread.slots[0].id;
  if (!store.replaceCardLayout(layout)) {
    elements.autoPlaceStatus.textContent = "カードを配置できませんでした。";
    return;
  }
  elements.autoPlaceStatus.textContent = `${spread.slots.length}枚を配置しました。`;
  if (elements.cardPickerDialog.open) renderCardGrid(store.getState());
}

function removeAllCards() {
  const state = store.getState();
  const activeSlotIds = spread.slots.map((slot) => slot.id);
  const hasPlacedCards = activeSlotIds.some((slotId) => state.slots[slotId]?.cardId);
  if (!hasPlacedCards || !window.confirm("すべてのカードを外しますか？")) return;
  if (store.clearCards(activeSlotIds)) {
    elements.autoPlaceStatus.textContent = "すべてのカードを外しました。";
  }
}

function setupThumbnailLoading() {
  thumbnailObserver?.disconnect();
  const images = elements.cardGrid.querySelectorAll("img[data-src]");
  if (!("IntersectionObserver" in window)) {
    images.forEach((image) => {
      image.src = image.dataset.src;
      delete image.dataset.src;
    });
    return;
  }
  thumbnailObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      image.src = image.dataset.src;
      delete image.dataset.src;
      observer.unobserve(image);
    });
  }, { root: elements.cardGrid, rootMargin: "300px 0px" });
  images.forEach((image) => thumbnailObserver.observe(image));
}

function renderCardGrid(state) {
  const cards = getCards(activeCardFilter);
  elements.cardResultCount.textContent = `${cards.length}枚`;
  elements.cardGrid.replaceChildren(...cards.map((card) => createCardChoice(card, state)));
  elements.cardGrid.scrollTop = 0;
  setupThumbnailLoading();
}

function openCardPicker(slotId) {
  cardPickerReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  selectedSlotId = slotId;
  updateCardActions(store.getState());
  schedulePreview(store.getState());
  activeCardFilter = "all";
  const slotDefinition = spread.slots.find((slot) => slot.id === slotId) ?? spread.slots[0];
  elements.cardPickerTarget.textContent = `${slotDefinition.name}に配置`;
  renderCardFilters();
  if (!elements.cardPickerDialog.open) {
    elements.cardPickerDialog.dataset.presentation = canUseDragAndDrop() ? "side-panel" : "modal";
    if (canUseDragAndDrop()) elements.cardPickerDialog.show();
    else elements.cardPickerDialog.showModal();
  }
  renderCardGrid(store.getState());
  window.requestAnimationFrame(() => elements.closeCardPicker.focus());
}

function restoreFocusAfterCardPicker() {
  const returnFocus = cardPickerReturnFocus;
  cardPickerReturnFocus = null;
  window.requestAnimationFrame(() => {
    const selectedSlotButton = elements.slotOverlay.querySelector(`[data-slot-id="${selectedSlotId}"]`);
    if (selectedSlotButton instanceof HTMLElement) selectedSlotButton.focus();
    else if (returnFocus?.isConnected) returnFocus.focus();
  });
}

function getDialogFocusableElements(dialog) {
  return [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, a[href], [tabindex]:not([tabindex='-1'])")]
    .filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function keepFocusInsideDialog(event, dialog) {
  if (event.key !== "Tab" || !dialog.open) return;
  const focusableElements = getDialogFocusableElements(dialog);
  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }
  const first = focusableElements[0];
  const last = focusableElements.at(-1);
  const focusIsOutside = !dialog.contains(document.activeElement);
  if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
    event.preventDefault();
    first.focus();
  }
}

function setHelpSection(sectionId, { focusTab = false } = {}) {
  const requestedTab = elements.helpDialog.querySelector(`[data-help-tab="${sectionId}"]`);
  const activeTab = requestedTab ?? elements.helpDialog.querySelector('[data-help-tab="usage"]');
  if (!(activeTab instanceof HTMLButtonElement)) return;
  const activeSection = activeTab.dataset.helpTab;

  elements.helpDialog.querySelectorAll("[data-help-tab]").forEach((tab) => {
    const isActive = tab === activeTab;
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
  elements.helpDialog.querySelectorAll("[data-help-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.helpPanel !== activeSection;
  });
  elements.helpDialog.querySelector(".help-content")?.scrollTo({ top: 0 });
  if (focusTab) activeTab.focus();
}

function openHelp(sectionId = "usage", trigger = document.activeElement) {
  helpReturnFocus = trigger instanceof HTMLElement ? trigger : null;
  setHelpSection(sectionId);
  if (!elements.helpDialog.open) elements.helpDialog.showModal();
  window.requestAnimationFrame(() => {
    elements.helpDialog.querySelector(`[data-help-tab="${sectionId}"]`)?.focus();
  });
}

function moveHelpTabFocus(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...elements.helpDialog.querySelectorAll("[data-help-tab]")];
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0) return;
  event.preventDefault();
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? tabs.length - 1
      : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  setHelpSection(tabs[nextIndex].dataset.helpTab, { focusTab: true });
}

function updateSlotOverlay(layout, state) {
  const slotNodes = [];

  layout.slots.forEach((slot) => {
    const button = document.createElement("button");
    const slotState = state.slots[slot.id];
    const card = getCard(slotState.cardId);
    const cardName = getCardName(card, state.cardNameDisplay);
    const hasCard = Boolean(card);
    const hitRect = slot.hitRect ?? slot.rect;
    button.type = "button";
    button.className = `slot-button${slot.id === selectedSlotId ? " is-selected" : ""}`;
    button.dataset.slotId = slot.id;
    button.dataset.dropHint = hasCard ? "入れ替え" : "ここに配置";
    button.style.left = `${(hitRect.x / spread.canvas.width) * 100}%`;
    button.style.top = `${(hitRect.y / spread.canvas.height) * 100}%`;
    button.style.width = `${(hitRect.width / spread.canvas.width) * 100}%`;
    button.style.height = `${(hitRect.height / spread.canvas.height) * 100}%`;
    button.style.zIndex = String(slot.drawOrder);
    button.setAttribute("aria-label", hasCard
      ? `${slot.name}、${cardName}、${slotState.reversed ? "逆位置" : "正位置"}。${slot.id === selectedSlotId ? "もう一度押すと正位置と逆位置を切り替えます" : "押すと編集対象にします"}`
      : `${slot.name}。押すとカードを選択します`);
    button.addEventListener("click", () => {
      if (dragController.shouldSuppressClick()) return;
      const wasSelected = selectedSlotId === slot.id;
      selectedSlotId = slot.id;
      if (store.getState().slots[slot.id].cardId) {
        if (wasSelected) store.toggleReversed(slot.id);
        else {
          updateCardActions(store.getState());
          schedulePreview(store.getState());
        }
      } else openCardPicker(slot.id);
    });
    dragController.attachSlot(button, slot.id, hasCard);
    slotNodes.push(button);
  });

  elements.slotOverlay.replaceChildren(...slotNodes);
}

function renderChoiceNameFields(state) {
  if (spread.kind !== "choice") {
    elements.choiceNameFields.replaceChildren();
    return;
  }

  const groupIds = spread.groups.map((group) => group.id);
  const currentIds = [...elements.choiceNameFields.querySelectorAll("input")].map((input) => input.dataset.groupId);
  const shouldRebuild = groupIds.length !== currentIds.length
    || groupIds.some((groupId, index) => groupId !== currentIds[index]);

  if (shouldRebuild) {
    const fields = spread.groups.map((group, index) => {
      const label = document.createElement("label");
      label.className = "choice-name-field";
      const labelText = document.createElement("span");
      labelText.textContent = `選択肢${index + 1}`;
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 50;
      input.autocomplete = "off";
      input.dataset.groupId = group.id;
      input.setAttribute("aria-label", `選択肢${index + 1}の名前`);
      input.addEventListener("input", (event) => store.setGroupLabel(group.id, event.target.value));
      label.append(labelText, input);
      return label;
    });
    elements.choiceNameFields.replaceChildren(...fields);
  }

  elements.choiceNameFields.querySelectorAll("input").forEach((input) => {
    if (document.activeElement === input) return;
    const nextValue = state.groupLabels[input.dataset.groupId] ?? "";
    if (input.value !== nextValue) input.value = nextValue;
  });
}

function updateCardActions(state) {
  const slotDefinition = spread.slots.find((slot) => slot.id === selectedSlotId) ?? spread.slots[0];
  const slotState = state.slots[slotDefinition.id];
  const card = getCard(slotState.cardId);
  const cardName = getCardName(card, state.cardNameDisplay);
  elements.selectedSlotText.textContent = cardName ? `${slotDefinition.name}：${cardName}` : slotDefinition.name;
  elements.replaceCardButton.textContent = card ? "カード変更" : "カードを選択";
  elements.toggleOrientationButton.disabled = !card;
  elements.removeCardButton.disabled = !card;
  elements.toggleOrientationButton.textContent = card
    ? (slotState.reversed ? "正位置に戻す" : "逆位置にする")
    : "正逆切替";
  elements.toggleOrientationButton.setAttribute("aria-label", card
    ? (slotState.reversed ? "選択中のカードを正位置に戻す" : "選択中のカードを逆位置にする")
    : "選択中のカードの正逆を切り替える");
  elements.selectedRoleInput.setAttribute("aria-label", `${slotDefinition.name}の役割名`);
  if (document.activeElement !== elements.selectedRoleInput && elements.selectedRoleInput.value !== slotState.label) {
    elements.selectedRoleInput.value = slotState.label;
  }
}

function updateCardNameAvailability(state) {
  const cards = spread.slots.map((slot) => getCard(state.slots[slot.id]?.cardId)).filter(Boolean);
  const availability = getCardNameSettingAvailability(
    cards,
    state.cardNameDisplay,
    state.output.displayCardNames,
  );
  elements.suitStyleFieldset.disabled = !availability.suit;
  elements.numberStyleFieldset.disabled = !availability.number;
  elements.aceStyleFieldset.disabled = !availability.ace;
  elements.courtStyleFieldset.disabled = !availability.court;

  if (!state.output.displayCardNames) {
    elements.cardNameSettingsNote.textContent = "カード名を非表示にしているため、日本語の詳細設定は無効です。";
  } else if (state.cardNameDisplay.language === "en") {
    elements.cardNameSettingsNote.textContent = "Englishではカード名の形式は固定です。入力したテーマや役割名は翻訳されません。";
  } else if (!availability.hasCards) {
    elements.cardNameSettingsNote.textContent = "カードを配置すると、該当する日本語の詳細設定を変更できます。";
  } else {
    elements.cardNameSettingsNote.textContent = "配置されているカードに関係する項目だけ変更できます。";
  }
}

function syncControls(state) {
  updateSpreadLanguageUi(state);
  if (elements.questionInput.value !== state.question) elements.questionInput.value = state.question;
  elements.dateEnabled.checked = state.date.enabled;
  elements.dateOptions.hidden = !state.date.enabled;
  elements.singleDateField.hidden = state.date.mode !== "single";
  elements.rangeDateFields.hidden = state.date.mode !== "range";
  elements.singleDateInput.value = state.date.single;
  elements.startDateInput.value = state.date.start;
  elements.endDateInput.value = state.date.end;
  document.querySelectorAll('input[name="dateMode"]').forEach((radio) => {
    radio.checked = radio.value === state.date.mode;
  });
  document.querySelectorAll('input[name="choiceOptionCount"]').forEach((radio) => {
    radio.checked = Number(radio.value) === state.choiceSpread.optionCount;
  });
  elements.choiceCommonEnabled.checked = state.choiceSpread.commonEnabled;
  elements.removeAllCards.disabled = !spread.slots.some((slot) => state.slots[slot.id]?.cardId);
  elements.customColorInput.value = state.background.solidColor;

  const cardNameGroups = {
    cardLanguage: state.cardNameDisplay.language,
    suitStyle: state.cardNameDisplay.suitStyle,
    numberStyle: state.cardNameDisplay.numberStyle,
    aceStyle: state.cardNameDisplay.aceStyle,
    courtStyle: state.cardNameDisplay.courtStyle,
  };
  Object.entries(cardNameGroups).forEach(([groupName, value]) => {
    document.querySelectorAll(`input[name="${groupName}"]`).forEach((radio) => {
      radio.checked = radio.value === value;
    });
  });

  elements.showSpreadName.checked = state.output.displaySpreadName;
  elements.showCardNames.checked = state.output.displayCardNames;
  elements.showOrientations.checked = state.output.displayOrientations !== false;
  document.querySelectorAll('input[name="outputFont"]').forEach((radio) => {
    radio.checked = radio.value === state.output.fontFamily;
  });

  document.querySelectorAll('input[name="backgroundMode"]').forEach((radio) => {
    radio.checked = radio.value === state.background.mode;
  });
  elements.presetBackgrounds.hidden = state.background.mode !== "preset";
  elements.solidBackgrounds.hidden = state.background.mode !== "solid";
  elements.presetBackgrounds.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeId === state.background.presetId));
  });
  elements.solidSwatches.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.color.toLowerCase() === state.background.solidColor.toLowerCase()));
  });
  renderChoiceNameFields(state);
  updateCardNameAvailability(state);
  updateCardActions(state);
  if (elements.cardPickerDialog.open) renderCardGrid(state);
}

async function renderPreview(state) {
  const revision = ++renderRevision;
  try {
    const editorBuffer = document.createElement("canvas");
    const outputBuffer = document.createElement("canvas");
    const [layout] = await Promise.all([
      renderReading(editorBuffer, {
        spread,
        state,
        getCard,
        getCardName,
        branding: APP_CONFIG.branding,
        scale: 1,
        mode: "editor",
      }),
      renderReading(outputBuffer, {
        spread,
        state,
        getCard,
        getCardName,
        branding: APP_CONFIG.branding,
        scale: 1,
        mode: "output",
      }),
    ]);
    if (revision !== renderRevision) return;
    copyCanvas(editorBuffer, elements.canvas);
    copyCanvas(outputBuffer, elements.exportPreviewCanvas);
    if (elements.imagePreviewDialog.open) {
      copyCanvas(elements.exportPreviewCanvas, elements.fullSizePreviewCanvas);
      fitImagePreviewCanvas();
    }
    updateSlotOverlay(layout, state);
    elements.previewStatus.textContent = "";
    elements.previewStatus.hidden = true;
  } catch (error) {
    if (revision !== renderRevision) return;
    console.error(error);
    elements.previewStatus.textContent = "プレビューを更新できませんでした。画像の読み込みを確認して、もう一度お試しください。";
    elements.previewStatus.hidden = false;
  }
}

function copyCanvas(source, target) {
  target.width = source.width;
  target.height = source.height;
  target.getContext("2d").drawImage(source, 0, 0);
}

function fitImagePreviewCanvas() {
  if (!elements.imagePreviewDialog.open) return;
  const stage = elements.fullSizePreviewCanvas.closest(".image-preview-stage");
  if (!stage) return;
  const stageStyle = window.getComputedStyle(stage);
  const availableWidth = stage.clientWidth
    - Number.parseFloat(stageStyle.paddingLeft)
    - Number.parseFloat(stageStyle.paddingRight);
  const availableHeight = stage.clientHeight
    - Number.parseFloat(stageStyle.paddingTop)
    - Number.parseFloat(stageStyle.paddingBottom);
  const scale = Math.min(
    availableWidth / elements.fullSizePreviewCanvas.width,
    availableHeight / elements.fullSizePreviewCanvas.height,
    1,
  );
  elements.fullSizePreviewCanvas.style.width = `${Math.max(1, elements.fullSizePreviewCanvas.width * scale)}px`;
  elements.fullSizePreviewCanvas.style.height = `${Math.max(1, elements.fullSizePreviewCanvas.height * scale)}px`;
}

function openFullSizePreview() {
  copyCanvas(elements.exportPreviewCanvas, elements.fullSizePreviewCanvas);
  elements.imagePreviewDialog.showModal();
  window.requestAnimationFrame(() => {
    fitImagePreviewCanvas();
    elements.closeImagePreview.focus();
  });
}

function schedulePreview(state) {
  pendingRenderState = state;
  if (renderFrame) return;
  renderFrame = window.requestAnimationFrame(() => {
    renderFrame = 0;
    void renderPreview(pendingRenderState);
  });
}

function buildAutomaticFilename() {
  return `tarot-${spread.slug}-${createTimestamp()}`;
}

function updateSaveFormatUi() {
  const format = document.querySelector('input[name="exportFormat"]:checked').value;
  elements.jpegQualityField.hidden = format !== "jpeg";
}

function bindEvents() {
  elements.spreadSelect.addEventListener("change", (event) => changeSpread(event.target.value));
  document.querySelectorAll('input[name="choiceOptionCount"]').forEach((radio) => {
    radio.addEventListener("change", (event) => changeChoiceSpreadSettings({ optionCount: Number(event.target.value) }));
  });
  elements.choiceCommonEnabled.addEventListener("change", (event) => changeChoiceSpreadSettings({ commonEnabled: event.target.checked }));
  elements.questionInput.addEventListener("input", (event) => store.setQuestion(event.target.value));
  elements.autoPlaceCards.addEventListener("click", placeCardsAutomatically);
  elements.removeAllCards.addEventListener("click", removeAllCards);
  elements.dateEnabled.addEventListener("change", (event) => store.setDate({ enabled: event.target.checked }));
  document.querySelectorAll('input[name="dateMode"]').forEach((radio) => {
    radio.addEventListener("change", (event) => store.setDate({ mode: event.target.value }));
  });
  elements.singleDateInput.addEventListener("change", (event) => store.setDate({ single: event.target.value }));
  elements.startDateInput.addEventListener("change", (event) => store.setDate({ start: event.target.value }));
  elements.endDateInput.addEventListener("change", (event) => store.setDate({ end: event.target.value }));

  const cardNameSettingGroups = {
    cardLanguage: "language",
    suitStyle: "suitStyle",
    numberStyle: "numberStyle",
    aceStyle: "aceStyle",
    courtStyle: "courtStyle",
  };
  Object.entries(cardNameSettingGroups).forEach(([groupName, stateKey]) => {
    document.querySelectorAll(`input[name="${groupName}"]`).forEach((radio) => {
      radio.addEventListener("change", (event) => store.setCardNameDisplay({ [stateKey]: event.target.value }));
    });
  });
  elements.showSpreadName.addEventListener("change", (event) => store.setOutput({ displaySpreadName: event.target.checked }));
  elements.showCardNames.addEventListener("change", (event) => store.setOutput({ displayCardNames: event.target.checked }));
  elements.showOrientations.addEventListener("change", (event) => store.setOutput({ displayOrientations: event.target.checked }));
  document.querySelectorAll('input[name="outputFont"]').forEach((radio) => {
    radio.addEventListener("change", (event) => store.setOutput({ fontFamily: event.target.value }));
  });

  document.querySelectorAll('input[name="backgroundMode"]').forEach((radio) => {
    radio.addEventListener("change", (event) => store.setBackground({ mode: event.target.value }));
  });
  elements.customColorInput.addEventListener("input", (event) => store.setBackground({ mode: "solid", solidColor: event.target.value }));

  elements.replaceCardButton.addEventListener("click", () => openCardPicker(selectedSlotId));
  elements.selectedRoleInput.addEventListener("input", (event) => store.setSlotLabel(selectedSlotId, event.target.value));
  elements.toggleOrientationButton.addEventListener("click", () => store.toggleReversed(selectedSlotId));
  elements.removeCardButton.addEventListener("click", () => store.removeCard(selectedSlotId));
  elements.openImagePreview.addEventListener("click", openFullSizePreview);
  elements.closeImagePreview.addEventListener("click", () => elements.imagePreviewDialog.close());
  elements.imagePreviewDialog.addEventListener("close", () => {
    window.requestAnimationFrame(() => elements.openImagePreview.focus());
  });
  elements.imagePreviewDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      elements.imagePreviewDialog.close();
      return;
    }
    keepFocusInsideDialog(event, elements.imagePreviewDialog);
  });
  window.addEventListener("resize", fitImagePreviewCanvas);
  elements.closeCardPicker.addEventListener("click", () => elements.cardPickerDialog.close());
  elements.cardPickerDialog.addEventListener("close", () => {
    thumbnailObserver?.disconnect();
    restoreFocusAfterCardPicker();
  });
  elements.cardPickerDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.cardPickerDialog.open) {
      event.preventDefault();
      elements.cardPickerDialog.close();
      return;
    }
    keepFocusInsideDialog(event, elements.cardPickerDialog);
  });
  desktopDragQuery.addEventListener("change", () => {
    if (elements.cardPickerDialog.open) elements.cardPickerDialog.close();
    schedulePreview(store.getState());
  });

  elements.openHelp.addEventListener("click", (event) => openHelp("usage", event.currentTarget));
  document.querySelectorAll("[data-help-section]").forEach((button) => {
    button.addEventListener("click", (event) => openHelp(event.currentTarget.dataset.helpSection, event.currentTarget));
  });
  elements.helpDialog.querySelectorAll("[data-help-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setHelpSection(tab.dataset.helpTab));
    tab.addEventListener("keydown", moveHelpTabFocus);
  });
  elements.closeHelp.addEventListener("click", () => elements.helpDialog.close());
  elements.helpDialog.addEventListener("close", () => {
    const returnFocus = helpReturnFocus;
    helpReturnFocus = null;
    window.requestAnimationFrame(() => {
      if (returnFocus?.isConnected) returnFocus.focus();
    });
  });
  elements.helpDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      elements.helpDialog.close();
      return;
    }
    keepFocusInsideDialog(event, elements.helpDialog);
  });

  document.querySelectorAll('input[name="exportFormat"]').forEach((radio) => radio.addEventListener("change", updateSaveFormatUi));
  elements.jpegQuality.addEventListener("input", () => {
    elements.jpegQualityOutput.value = `${elements.jpegQuality.value}%`;
  });
  elements.filenameInput.addEventListener("input", () => {
    filenameEdited = true;
  });
  elements.saveImageButton.addEventListener("click", async () => {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const size = document.querySelector('input[name="exportSize"]:checked').value;
    const fallbackFilenameBase = buildAutomaticFilename();
    if (!filenameEdited) elements.filenameInput.value = fallbackFilenameBase;
    elements.saveImageButton.disabled = true;
    elements.saveImageButton.textContent = "保存中…";
    elements.saveCard.setAttribute("aria-busy", "true");
    elements.saveStatus.textContent = "画像を作成しています…";
    try {
      await exportReadingImage({
        spread,
        state: store.getState(),
        getCard,
        getCardName,
        branding: APP_CONFIG.branding,
        format,
        scale: size === "high" ? APP_CONFIG.export.highResolutionScale : APP_CONFIG.export.standardScale,
        jpegQuality: Number(elements.jpegQuality.value) / 100,
        filenameBase: elements.filenameInput.value,
        fallbackFilenameBase,
      });
      elements.saveStatus.textContent = "保存を開始しました。";
    } catch (error) {
      console.error(error);
      elements.saveStatus.textContent = error.message || "画像を保存できませんでした。";
    } finally {
      elements.saveImageButton.disabled = false;
      elements.saveImageButton.textContent = "保存する";
      elements.saveCard.removeAttribute("aria-busy");
    }
  });
}

renderSpreadOptions();
renderThemeControls();
bindEvents();
elements.footerCopyright.textContent = APP_CONFIG.copyright;
elements.aboutCopyright.textContent = APP_CONFIG.copyright;
elements.filenameInput.value = buildAutomaticFilename();
updateSaveFormatUi();
updateSpreadUi(store.getState());
syncControls(store.getState());
store.subscribe((state) => {
  syncControls(state);
  schedulePreview(state);
});
schedulePreview(store.getState());
