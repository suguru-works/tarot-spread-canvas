import { resolveBackgroundTheme } from "../data/themes.js?v=1.0.0-rc9";
import { loadImage } from "../services/asset-loader.js";
import { loadBackgroundImage } from "../services/background-repository.js?v=1.0.0-rc9";
import { formatReadingDate } from "../utils/date.js";
import { getSpreadName } from "../data/spreads.js?v=1.0.0-rc9";

const FONT_STACKS = Object.freeze({
  gothic: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif',
  mincho: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", serif',
});

const TYPOGRAPHY = Object.freeze({
  spreadTitle: 48,
  date: 32,
  question: 34,
  groupLabel: 38,
  captionLineHeight: 38,
  signature: 20,
  metaLineHeight: 39,
});

function getFontStack(state) {
  return FONT_STACKS[state.output?.fontFamily] ?? FONT_STACKS.gothic;
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function drawProgrammaticBackground(ctx, width, height, paint, colors) {
  if (paint.kind === "solid") {
    ctx.fillStyle = paint.color;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  paint.stops.forEach((stop) => gradient.addColorStop(stop.at, stop.color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (paint.pattern === "rings") {
    ctx.save();
    ctx.globalAlpha = 0.075;
    ctx.strokeStyle = colors.accent;
    for (let index = 0; index < 22; index += 1) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 80 + index * 58, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (paint.pattern === "stars") {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    for (let index = 0; index < 90; index += 1) {
      const x = ((index * 137.5) % 1000) / 1000 * width;
      const y = ((index * 83.7 + 41) % 1000) / 1000 * height;
      const radius = index % 11 === 0 ? 2.1 : 1.1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (paint.pattern === "grain") {
    ctx.save();
    ctx.strokeStyle = "rgba(218,166,111,0.08)";
    ctx.lineWidth = 3;
    for (let y = 36; y < height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.3, y - 13, width * 0.7, y + 12, width, y - 3);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function getImageCoverSource(imageWidth, imageHeight, width, height) {
  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (imageRatio > canvasRatio) {
    sourceWidth = imageHeight * canvasRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imageWidth / canvasRatio;
    sourceY = (imageHeight - sourceHeight) / 2;
  }

  return { sourceX, sourceY, sourceWidth, sourceHeight };
}

function drawImageCover(ctx, image, width, height) {
  const { sourceX, sourceY, sourceWidth, sourceHeight } = getImageCoverSource(
    image.naturalWidth,
    image.naturalHeight,
    width,
    height,
  );
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

async function drawBackground(ctx, width, height, theme) {
  if (theme.paint.kind !== "image") {
    drawProgrammaticBackground(ctx, width, height, theme.paint, theme.colors);
    return;
  }

  drawProgrammaticBackground(ctx, width, height, theme.paint.fallback, theme.colors);
  const image = await loadBackgroundImage(theme.source);
  if (!image) return;

  drawImageCover(ctx, image, width, height);
  if (theme.paint.overlay) {
    ctx.fillStyle = theme.paint.overlay;
    ctx.fillRect(0, 0, width, height);
  }
}

function splitTextUnits(text) {
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

function wrapText(ctx, text, maxWidth, maxLines = 2) {
  const units = splitTextUnits(String(text).trim());
  const lines = [];
  let current = "";

  units.forEach((unit) => {
    const candidate = current + unit;
    if (!current || ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      return;
    }
    lines.push(current.trim());
    current = unit;
  });
  if (current) lines.push(current.trim());

  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  let finalLine = visible[maxLines - 1];
  while (finalLine && ctx.measureText(`${finalLine}…`).width > maxWidth) {
    finalLine = finalLine.slice(0, -1);
  }
  visible[maxLines - 1] = `${finalLine}…`;
  return visible;
}

function drawCenteredText(ctx, text, x, y, size, color, weight = 700, fontStack = FONT_STACKS.gothic, shadowColor = "rgba(0,0,0,0.72)") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = Math.max(3, size * 0.16);
  ctx.shadowOffsetY = 2;
  ctx.font = `${weight} ${size}px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawFittedText(ctx, text, x, y, maxWidth, initialSize, minSize, color, weight = 700, fontStack = FONT_STACKS.gothic, shadowColor = "rgba(0,0,0,0.72)", textAlign = "center") {
  ctx.save();
  let size = initialSize;
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = Math.max(3, initialSize * 0.16);
  ctx.shadowOffsetY = 2;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${fontStack}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

function measureQuestionLines(ctx, question, width, fontStack) {
  if (!question) return [];
  ctx.font = `700 ${TYPOGRAPHY.question}px ${fontStack}`;
  return wrapText(ctx, question, width, 2);
}

function getRotatedBounds(rect) {
  const radians = (rect.rotation * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const width = rect.width * cosine + rect.height * sine;
  const height = rect.width * sine + rect.height * cosine;
  return {
    x: rect.centerX - width / 2,
    y: rect.centerY - height / 2,
    width,
    height,
    centerX: rect.centerX,
    centerY: rect.centerY,
  };
}

export function getSceneLayout(ctx, spread, state, { mode = "output" } = {}) {
  const fontStack = getFontStack(state);
  const showSpreadName = state.output?.displaySpreadName !== false;
  const dateText = formatReadingDate(state.date);
  const questionLines = measureQuestionLines(ctx, state.question.trim(), spread.canvas.width - 160, fontStack);
  const metaLineCount = (dateText ? 1 : 0) + questionLines.length;
  const titleOffset = showSpreadName ? 0 : -64;
  const cardTop = 135 + titleOffset + metaLineCount * TYPOGRAPHY.metaLineHeight;
  const hasCardCaption = spread.slots.some((slot) => {
    const slotState = state.slots[slot.id];
    if (!slotState?.cardId) return Boolean(slotState?.label?.trim());
    if (slotState.label?.trim()) return true;
    return state.output?.displayCardNames !== false || state.output?.displayOrientations !== false;
  });
  const maximumCardBottom = hasCardCaption ? 770 : 840;
  const metaOffset = titleOffset + metaLineCount * TYPOGRAPHY.metaLineHeight;
  const firstMetaY = showSpreadName ? 118 : 54;

  return {
    showSpreadName,
    titleY: 64,
    dateText,
    dateY: firstMetaY,
    questionLines,
    questionStartY: firstMetaY + (dateText ? TYPOGRAPHY.metaLineHeight : 0),
    groups: (spread.groups ?? []).map((group) => ({
      ...group,
      captionLayout: {
        centerX: group.caption.centerX,
        y: group.caption.y + metaOffset,
        maxWidth: group.caption.maxWidth,
      },
    })),
    slots: spread.slots.map((slot) => {
      const usesAbsoluteY = Number.isFinite(slot.placement.centerY);
      const height = usesAbsoluteY
        ? slot.placement.height
        : Math.min(slot.placement.height, Math.max(520, maximumCardBottom - cardTop));
      const centerY = usesAbsoluteY ? slot.placement.centerY + metaOffset : cardTop + height / 2;
      const rect = {
        x: slot.placement.centerX - slot.placement.width / 2,
        y: centerY - height / 2,
        width: slot.placement.width,
        height,
        centerX: slot.placement.centerX,
        centerY,
        rotation: slot.placement.rotation,
      };
      return {
        ...slot,
        rect,
        hitRect: getRotatedBounds(rect),
        captionLayout: slot.caption ? {
          ...slot.caption,
          x: slot.caption.x ?? slot.caption.centerX,
          y: slot.caption.y + metaOffset,
          anchor: slot.caption.anchor ?? "center",
        } : null,
      };
    }),
  };
}

function drawCard(ctx, image, rect, reversed, theme, fontStack, hasCard, showEmptyHint) {
  const { width, height, centerX, centerY, rotation } = rect;
  const x = -width / 2;
  const y = -height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation * Math.PI) / 180);

  roundedRectPath(ctx, x - 10, y - 10, width + 20, height + 20, 22);
  ctx.fillStyle = theme.colors.cardHalo;
  ctx.fill();
  ctx.strokeStyle = theme.colors.cardBorder;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  roundedRectPath(ctx, x, y, width, height, 18);
  ctx.clip();
  ctx.fillStyle = theme.colors.cardSurface;
  ctx.fillRect(x, y, width, height);

  if (image) {
    const imageRatio = image.width / image.height;
    const boxRatio = width / height;
    let drawWidth;
    let drawHeight;

    if (imageRatio > boxRatio) {
      drawWidth = width;
      drawHeight = width / imageRatio;
    } else {
      drawHeight = height;
      drawWidth = height * imageRatio;
    }

    ctx.save();
    if (reversed) ctx.rotate(Math.PI);
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  } else {
    ctx.fillStyle = theme.colors.placeholder;
    ctx.fillRect(x, y, width, height);
    const message = hasCard ? "画像を読み込めません" : (showEmptyHint ? "カードを選択" : "");
    if (message) {
      drawCenteredText(
        ctx,
        message,
        0,
        0,
        28,
        theme.colors.muted,
        700,
        fontStack,
        theme.colors.textShadow,
      );
    }
  }

  ctx.restore();
  ctx.restore();
}

async function loadSlotImages(spread, state, getCard) {
  const entries = await Promise.all(spread.slots.map(async (slot) => {
    const card = getCard(state.slots[slot.id]?.cardId);
    if (!card?.images?.full) return [slot.id, null];
    try {
      return [slot.id, await loadImage(card.images.full)];
    } catch {
      return [slot.id, null];
    }
  }));
  return new Map(entries);
}

export async function renderReading(canvas, {
  spread,
  state,
  getCard,
  getCardName,
  branding,
  scale = 1,
  mode = "output",
}) {
  const width = spread.canvas.width;
  const height = spread.canvas.height;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const theme = resolveBackgroundTheme(state.background);
  const fontStack = getFontStack(state);
  const [, slotImages] = await Promise.all([
    drawBackground(ctx, width, height, theme),
    loadSlotImages(spread, state, getCard),
  ]);

  const layout = getSceneLayout(ctx, spread, state, { mode });
  if (layout.showSpreadName) {
    drawCenteredText(
      ctx,
      getSpreadName(spread, state.cardNameDisplay.language),
      width / 2,
      layout.titleY,
      TYPOGRAPHY.spreadTitle,
      theme.colors.accent,
      800,
      fontStack,
      theme.colors.textShadow,
    );
  }

  if (layout.dateText) {
    drawCenteredText(ctx, layout.dateText, width / 2, layout.dateY, TYPOGRAPHY.date, theme.colors.text, 700, fontStack, theme.colors.textShadow);
  }

  layout.questionLines.forEach((line, index) => {
    drawCenteredText(ctx, line, width / 2, layout.questionStartY + index * TYPOGRAPHY.metaLineHeight, TYPOGRAPHY.question, theme.colors.text, 700, fontStack, theme.colors.textShadow);
  });

  layout.groups.forEach((group) => {
    const groupLabel = state.groupLabels?.[group.id]?.trim();
    if (!groupLabel) return;
    drawFittedText(
      ctx,
      groupLabel,
      group.captionLayout.centerX,
      group.captionLayout.y,
      group.captionLayout.maxWidth,
      TYPOGRAPHY.groupLabel,
      18,
      theme.colors.accent,
      800,
      fontStack,
      theme.colors.textShadow,
    );
  });

  const slotsByDrawOrder = [...layout.slots].sort((left, right) => left.drawOrder - right.drawOrder);

  slotsByDrawOrder.forEach((slot) => {
    const slotState = state.slots[slot.id];
    const card = getCard(slotState.cardId);
    drawCard(
      ctx,
      slotImages.get(slot.id),
      slot.rect,
      slotState.reversed,
      theme,
      fontStack,
      Boolean(card),
      mode === "editor",
    );
  });

  layout.slots.forEach((slot) => {
    const slotState = state.slots[slot.id];
    const card = getCard(slotState.cardId);

    const showCardName = state.output?.displayCardNames !== false;
    const showOrientation = state.output?.displayOrientations !== false;
    const cardName = showCardName
      ? getCardName(card, state.cardNameDisplay)
      : "";
    const roleLabel = slotState.label.trim();
    const captionX = slot.captionLayout?.x ?? slot.hitRect.centerX;
    const captionY = slot.captionLayout?.y ?? slot.hitRect.y + slot.hitRect.height + 34;
    const captionMaxWidth = slot.captionLayout?.maxWidth ?? slot.rect.width + 120;
    const captionTextAlign = slot.captionLayout?.anchor === "left" ? "left" : "center";
    const roleFontSize = Math.min(36, Math.max(23, slot.rect.width * 0.11));
    const cardFontSize = Math.min(34, Math.max(21, slot.rect.width * 0.095));
    const orientationFontSize = Math.min(29, Math.max(20, slot.rect.width * 0.085));

    const captionLines = [];
    if (roleLabel) captionLines.push({ text: roleLabel, color: theme.colors.accent, size: roleFontSize, weight: 800 });
    if (cardName) {
      let cardNameLines = [cardName];
      if (slot.captionLayout?.wrapCardName) {
        ctx.save();
        ctx.font = `700 ${cardFontSize}px ${fontStack}`;
        cardNameLines = wrapText(ctx, cardName, captionMaxWidth, 2);
        ctx.restore();
      }
      cardNameLines.forEach((line) => captionLines.push({ text: line, color: theme.colors.text, size: cardFontSize, weight: 700 }));
    }
    if (card && showOrientation) {
      const isEnglish = state.cardNameDisplay.language === "en";
      const orientation = slotState.reversed
        ? (isEnglish ? "Reversed" : "逆位置")
        : (isEnglish ? "Upright" : "正位置");
      captionLines.push({ text: orientation, color: theme.colors.muted, size: orientationFontSize, weight: 700 });
    }

    const captionStartY = slot.captionLayout?.verticalAnchor === "middle"
      ? captionY - ((captionLines.length - 1) * TYPOGRAPHY.captionLineHeight) / 2
      : captionY;

    captionLines.forEach((line, index) => {
      drawFittedText(
        ctx,
        line.text,
        captionX,
        captionStartY + index * TYPOGRAPHY.captionLineHeight,
        captionMaxWidth,
        line.size,
        15,
        line.color,
        line.weight,
        fontStack,
        theme.colors.textShadow,
        captionTextAlign,
      );
    });
  });

  if (state.brandingVisible && branding.serviceName) {
    ctx.save();
    ctx.font = `600 ${TYPOGRAPHY.signature}px ${fontStack}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = theme.colors.muted;
    ctx.shadowColor = theme.colors.textShadow;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    const signature = branding.url ? `${branding.serviceName}  ${branding.url}` : branding.serviceName;
    ctx.fillText(signature, width - 30, height - 24);
    ctx.restore();
  }

  return layout;
}
