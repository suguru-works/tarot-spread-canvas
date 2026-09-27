const DRAG_MIME = "application/x-tarot-spread-card";
const CLICK_SUPPRESSION_MS = 450;
const RELEASE_OVERLAP_THRESHOLD = 0.5;

export function getRectangleOverlapRatio(first, second) {
  const left = Math.max(first.left, second.left);
  const top = Math.max(first.top, second.top);
  const right = Math.min(first.right, second.right);
  const bottom = Math.min(first.bottom, second.bottom);
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
  const firstArea = Math.max(0, first.width) * Math.max(0, first.height);
  return firstArea > 0 ? intersection / firstArea : 1;
}

export function shouldReleaseDraggedCard({
  sourceRect,
  pointerOffset,
  clientX,
  clientY,
  viewportWidth,
  viewportHeight,
}) {
  const coordinatesAreSafe = Number.isFinite(clientX)
    && Number.isFinite(clientY)
    && clientX > 0
    && clientY > 0
    && clientX < viewportWidth
    && clientY < viewportHeight;
  if (!coordinatesAreSafe || !sourceRect?.width || !sourceRect?.height) return false;

  const offsetX = pointerOffset?.x ?? sourceRect.width / 2;
  const offsetY = pointerOffset?.y ?? sourceRect.height / 2;
  const movedLeft = clientX - offsetX;
  const movedTop = clientY - offsetY;
  const movedRect = {
    left: movedLeft,
    top: movedTop,
    right: movedLeft + sourceRect.width,
    bottom: movedTop + sourceRect.height,
    width: sourceRect.width,
    height: sourceRect.height,
  };
  return getRectangleOverlapRatio(movedRect, sourceRect) < RELEASE_OVERLAP_THRESHOLD;
}

export function createDragController({ isEnabled, onDropCard, onMoveCard, onReleaseCard, onDragStateChange }) {
  let activeDrag = null;
  let suppressClickUntil = 0;

  function noteDragCancellation(event) {
    if (event.key === "Escape" && activeDrag) activeDrag.cancelled = true;
  }

  function finishDrag(sourceElement) {
    sourceElement?.classList.remove("is-drag-source");
    document.querySelectorAll(".is-drag-source, .is-drop-target").forEach((element) => {
      element.classList.remove("is-drag-source", "is-drop-target");
    });
    if (activeDrag) suppressClickUntil = performance.now() + CLICK_SUPPRESSION_MS;
    document.removeEventListener("keydown", noteDragCancellation, true);
    activeDrag = null;
    onDragStateChange(false, null);
  }

  function beginDrag(event, payload) {
    if (!isEnabled()) {
      event.preventDefault();
      return;
    }
    const sourceRect = event.currentTarget.getBoundingClientRect();
    activeDrag = {
      ...payload,
      sourceRect,
      pointerOffset: {
        x: Math.min(sourceRect.width, Math.max(0, event.clientX - sourceRect.left)),
        y: Math.min(sourceRect.height, Math.max(0, event.clientY - sourceRect.top)),
      },
      dropHandled: false,
      cancelled: false,
    };
    document.addEventListener("keydown", noteDragCancellation, true);
    event.currentTarget.classList.add("is-drag-source");
    event.dataTransfer.effectAllowed = payload.kind === "catalog" ? "copy" : "move";
    event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", payload.kind === "catalog" ? payload.cardId : payload.slotId);
    onDragStateChange(true, payload);
  }

  function allowDrop(event, targetElement) {
    if (!activeDrag || !isEnabled()) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = activeDrag.kind === "catalog" ? "copy" : "move";
    targetElement.classList.add("is-drop-target");
  }

  function finishSourceDrag(event, sourceElement) {
    const drag = activeDrag;
    if (drag?.kind === "slot" && !drag.dropHandled && !drag.cancelled) {
      const release = shouldReleaseDraggedCard({
        sourceRect: drag.sourceRect,
        pointerOffset: drag.pointerOffset,
        clientX: event.clientX,
        clientY: event.clientY,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: document.documentElement.clientHeight,
      });
      if (release) onReleaseCard(drag.slotId);
    }
    finishDrag(sourceElement);
  }

  function leaveDropTarget(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    event.currentTarget.classList.remove("is-drop-target");
  }

  return {
    shouldSuppressClick() {
      return performance.now() < suppressClickUntil;
    },
    attachCardChoice(element, cardId) {
      element.draggable = isEnabled();
      element.addEventListener("dragstart", (event) => beginDrag(event, { kind: "catalog", cardId }));
      element.addEventListener("dragend", (event) => finishSourceDrag(event, element));
    },
    attachSlot(element, slotId, hasCard) {
      element.draggable = Boolean(hasCard && isEnabled());
      if (hasCard) {
        element.addEventListener("dragstart", (event) => beginDrag(event, { kind: "slot", slotId }));
        element.addEventListener("dragend", (event) => finishSourceDrag(event, element));
      }
      element.addEventListener("dragover", (event) => allowDrop(event, element));
      element.addEventListener("dragleave", leaveDropTarget);
      element.addEventListener("drop", (event) => {
        if (!activeDrag || !isEnabled()) return;
        event.preventDefault();
        element.classList.remove("is-drop-target");
        activeDrag.dropHandled = true;
        if (activeDrag.kind === "catalog") onDropCard(activeDrag.cardId, slotId);
        if (activeDrag.kind === "slot" && activeDrag.slotId !== slotId) onMoveCard(activeDrag.slotId, slotId);
        finishDrag(null);
      });
    },
  };
}
