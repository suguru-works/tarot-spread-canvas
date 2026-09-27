import { renderReading } from "../canvas/renderer.js?v=1.0.0-rc13";
import { sanitizeFilenameBase } from "../utils/text.js";

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("画像データを生成できませんでした。"));
    }, mimeType, quality);
  });
}

export async function exportReadingImage({
  spread,
  state,
  getCard,
  getCardName,
  branding,
  format,
  scale,
  jpegQuality,
  filenameBase,
  fallbackFilenameBase,
}) {
  const canvas = document.createElement("canvas");
  await renderReading(canvas, { spread, state, getCard, getCardName, branding, scale });

  const isJpeg = format === "jpeg";
  const mimeType = isJpeg ? "image/jpeg" : "image/png";
  const extension = isJpeg ? "jpg" : "png";
  const quality = isJpeg ? jpegQuality : undefined;
  const blob = await canvasToBlob(canvas, mimeType, quality);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilenameBase(filenameBase, fallbackFilenameBase)}.${extension}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
