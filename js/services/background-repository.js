const backgroundImageCache = new Map();

export function loadBackgroundImage(source) {
  if (!source) return Promise.resolve(null);
  if (backgroundImageCache.has(source)) return backgroundImageCache.get(source);

  const request = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });

  backgroundImageCache.set(source, request);
  return request;
}
