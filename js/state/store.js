import { getLocalDateValue } from "../utils/date.js";
import { DEFAULT_CARD_NAME_DISPLAY } from "../data/cards.js?v=1.0.0-rc10";

export function createInitialReadingState(spread) {
  const today = getLocalDateValue();
  return {
    schemaVersion: 1,
    spreadId: spread.id,
    question: "",
    date: {
      enabled: false,
      mode: "single",
      single: today,
      start: today,
      end: today,
    },
    cardNameDisplay: { ...DEFAULT_CARD_NAME_DISPLAY },
    output: {
      displaySpreadName: true,
      displayCardNames: true,
      displayOrientations: true,
      fontFamily: "gothic",
    },
    background: {
      mode: "preset",
      presetId: "light",
      solidColor: "#15120f",
    },
    choiceSpread: {
      optionCount: 2,
      commonEnabled: true,
    },
    groupLabels: {},
    brandingVisible: true,
    slots: Object.fromEntries(
      spread.slots.map((slot) => [slot.id, { cardId: null, reversed: false, label: "" }]),
    ),
  };
}

export function createReadingStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const notify = () => listeners.forEach((listener) => listener(state));
  const update = (nextState) => {
    state = nextState;
    notify();
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setQuestion(question) {
      update({ ...state, question });
    },
    setDate(patch) {
      update({ ...state, date: { ...state.date, ...patch } });
    },
    setBackground(patch) {
      update({ ...state, background: { ...state.background, ...patch } });
    },
    setCardNameDisplay(patch) {
      update({
        ...state,
        cardNameDisplay: { ...state.cardNameDisplay, ...patch },
      });
    },
    setOutput(patch) {
      update({
        ...state,
        output: { ...state.output, ...patch },
      });
    },
    setSpread(currentSpread, nextSpread) {
      const nextSlots = Object.fromEntries(nextSpread.slots.map((slot, index) => {
        const currentSlotId = currentSpread.slots[index]?.id;
        const currentSlot = currentSlotId ? state.slots[currentSlotId] : null;
        return [slot.id, currentSlot
          ? { ...currentSlot }
          : { cardId: null, reversed: false, label: "" }];
      }));
      update({ ...state, spreadId: nextSpread.id, slots: nextSlots });
    },
    configureChoiceSpread(nextSpread, choiceSpread) {
      const nextSlots = Object.fromEntries(nextSpread.slots.map((slot) => {
        const currentSlot = state.slots[slot.id];
        return [slot.id, currentSlot
          ? { ...currentSlot }
          : { cardId: null, reversed: false, label: "" }];
      }));
      update({
        ...state,
        spreadId: nextSpread.id,
        choiceSpread: { ...state.choiceSpread, ...choiceSpread },
        slots: nextSlots,
      });
    },
    setGroupLabel(groupId, label) {
      update({
        ...state,
        groupLabels: { ...state.groupLabels, [groupId]: label },
      });
    },
    setSlotLabel(slotId, label) {
      const slot = state.slots[slotId];
      if (!slot) return;
      update({
        ...state,
        slots: { ...state.slots, [slotId]: { ...slot, label } },
      });
    },
    setCard(slotId, cardId) {
      const slot = state.slots[slotId];
      if (!slot || !cardId) return false;
      const isUsedElsewhere = Object.entries(state.slots).some(([otherSlotId, otherSlot]) => (
        otherSlotId !== slotId && otherSlot.cardId === cardId
      ));
      if (isUsedElsewhere) return false;
      update({
        ...state,
        slots: { ...state.slots, [slotId]: { ...slot, cardId, reversed: false } },
      });
      return true;
    },
    replaceCardLayout(layout) {
      const nextSlots = Object.fromEntries(Object.entries(state.slots).map(([slotId, slot]) => {
        const nextCard = layout[slotId];
        if (!nextCard) return [slotId, { ...slot }];
        return [slotId, {
          ...slot,
          cardId: nextCard.cardId ?? null,
          reversed: Boolean(nextCard.cardId && nextCard.reversed),
        }];
      }));
      const cardIds = Object.values(nextSlots).map((slot) => slot.cardId).filter(Boolean);
      if (new Set(cardIds).size !== cardIds.length) return false;
      update({ ...state, slots: nextSlots });
      return true;
    },
    toggleReversed(slotId) {
      const slot = state.slots[slotId];
      if (!slot?.cardId) return;
      update({
        ...state,
        slots: { ...state.slots, [slotId]: { ...slot, reversed: !slot.reversed } },
      });
    },
    removeCard(slotId) {
      const slot = state.slots[slotId];
      if (!slot) return false;
      update({
        ...state,
        slots: { ...state.slots, [slotId]: { ...slot, cardId: null, reversed: false } },
      });
      return true;
    },
    clearCards(slotIds) {
      const activeSlotIds = new Set(slotIds);
      const hasCards = Object.entries(state.slots).some(([slotId, slot]) => (
        activeSlotIds.has(slotId) && slot.cardId
      ));
      if (!hasCards) return false;
      const nextSlots = Object.fromEntries(Object.entries(state.slots).map(([slotId, slot]) => [
        slotId,
        activeSlotIds.has(slotId)
          ? { ...slot, cardId: null, reversed: false }
          : { ...slot },
      ]));
      update({ ...state, slots: nextSlots });
      return true;
    },
    moveCard(fromSlotId, toSlotId) {
      if (fromSlotId === toSlotId) return;
      const from = state.slots[fromSlotId];
      const to = state.slots[toSlotId];
      if (!from || !to) return;
      update({
        ...state,
        slots: {
          ...state.slots,
          [fromSlotId]: { ...from, cardId: to.cardId, reversed: to.reversed },
          [toSlotId]: { ...to, cardId: from.cardId, reversed: from.reversed },
        },
      });
    },
  };
}
