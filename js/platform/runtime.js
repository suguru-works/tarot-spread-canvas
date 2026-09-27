export function isTauriRuntime() {
  return Boolean(window.__TAURI__?.core?.invoke);
}

export function applyRuntimeContent() {
  const desktop = isTauriRuntime();
  document.documentElement.dataset.runtime = desktop ? "windows" : "web";
  document.querySelectorAll("[data-desktop-only]").forEach((element) => {
    element.hidden = !desktop;
  });
  document.querySelectorAll("[data-web-only]").forEach((element) => {
    element.hidden = desktop;
  });
  return desktop;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(new Error("保存画像を準備できませんでした。")), { once: true });
    reader.addEventListener("load", () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const separatorIndex = result.indexOf(",");
      if (separatorIndex < 0) {
        reject(new Error("保存画像を準備できませんでした。"));
        return;
      }
      resolve(result.slice(separatorIndex + 1));
    }, { once: true });
    reader.readAsDataURL(blob);
  });
}

export async function saveBlobWithNativeDialog({ blob, filename, format }) {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) throw new Error("Windows保存機能を利用できません。アプリを再起動してください。");

  const savedPath = await invoke("save_image", {
    suggestedName: filename,
    format,
    base64Data: await blobToBase64(blob),
  });

  return savedPath ? { status: "saved", path: savedPath } : { status: "cancelled" };
}
