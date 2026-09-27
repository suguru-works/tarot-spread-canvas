const DARK_COLORS = Object.freeze({
  text: "#f4ede4",
  muted: "#c9b9a8",
  accent: "#d7b06d",
  cardSurface: "#11100e",
  placeholder: "#2b241f",
  cardBorder: "rgba(215,176,109,0.45)",
  cardHalo: "rgba(255,255,255,0.045)",
  textShadow: "rgba(0,0,0,0.72)",
});

const PURPLE_COLORS = Object.freeze({
  text: "#fbf4ff",
  muted: "#d5c1de",
  accent: "#d8a8e8",
  cardSurface: "#120d17",
  placeholder: "#2a1d33",
  cardBorder: "rgba(216,168,232,0.5)",
  cardHalo: "rgba(255,255,255,0.045)",
  textShadow: "rgba(0,0,0,0.72)",
});

const LIGHT_COLORS = Object.freeze({
  text: "#352d24",
  muted: "#6c5f50",
  accent: "#73552b",
  cardSurface: "#e5dbc4",
  placeholder: "#e8ddc5",
  cardBorder: "rgba(91,67,35,0.5)",
  cardHalo: "rgba(255,255,255,0.36)",
  textShadow: "rgba(255,255,255,0.68)",
});

const MALACHITE_COLORS = Object.freeze({
  text: "#f4f5e9",
  muted: "#bed0bd",
  accent: "#d1b873",
  cardSurface: "#10271f",
  placeholder: "#24483a",
  cardBorder: "rgba(209,184,115,0.52)",
  cardHalo: "rgba(184,221,190,0.06)",
  textShadow: "rgba(2,18,12,0.78)",
});

function gradientPaint(stops, pattern = "rings") {
  return Object.freeze({
    kind: "programmatic",
    stops: Object.freeze(stops.map((stop) => Object.freeze(stop))),
    pattern,
  });
}

export const PRESET_THEMES = Object.freeze([
  Object.freeze({
    id: "light",
    name: "Light",
    type: "programmatic",
    paint: gradientPaint([
      { at: 0, color: "#f6efd9" },
      { at: 0.52, color: "#f1e7cf" },
      { at: 1, color: "#dfcfad" },
    ]),
    colors: LIGHT_COLORS,
    preview: "linear-gradient(135deg, #f6efd9, #dfcfad)",
  }),
  Object.freeze({
    id: "dark",
    name: "Dark",
    type: "programmatic",
    paint: gradientPaint([
      { at: 0, color: "#31251d" },
      { at: 0.48, color: "#19130f" },
      { at: 1, color: "#0e0b09" },
    ]),
    colors: DARK_COLORS,
    preview: "linear-gradient(135deg, #31251d, #0e0b09)",
  }),
  Object.freeze({
    id: "purple",
    name: "Elegance",
    type: "programmatic",
    paint: gradientPaint([
      { at: 0, color: "#382447" },
      { at: 0.5, color: "#1d1328" },
      { at: 1, color: "#0d0912" },
    ]),
    colors: PURPLE_COLORS,
    preview: "linear-gradient(135deg, #4b2860, #0d0912)",
  }),
  Object.freeze({
    id: "malachite",
    name: "Malachite",
    type: "programmatic",
    paint: gradientPaint([
      { at: 0, color: "#285b46" },
      { at: 0.52, color: "#183a2d" },
      { at: 1, color: "#0c241b" },
    ]),
    colors: MALACHITE_COLORS,
    preview: "linear-gradient(135deg, #34745a, #183a2d 52%, #0c241b)",
  }),
  Object.freeze({
    id: "cosmic",
    name: "Cosmic",
    type: "image",
    source: "./assets/backgrounds/cosmic.webp?v=1",
    paint: Object.freeze({
      kind: "image",
      fallback: gradientPaint([
        { at: 0, color: "#17244c" },
        { at: 0.52, color: "#24133d" },
        { at: 1, color: "#080a18" },
      ], "stars"),
      overlay: "rgba(5, 4, 18, 0.24)",
    }),
    colors: Object.freeze({ ...PURPLE_COLORS, accent: "#cbbcff" }),
    preview: "radial-gradient(circle at 30% 22%, #4d4f91, #24133d 42%, #080a18)",
  }),
  Object.freeze({
    id: "wood",
    name: "Wood",
    type: "image",
    source: "./assets/backgrounds/wood.webp?v=1",
    paint: Object.freeze({
      kind: "image",
      fallback: gradientPaint([
        { at: 0, color: "#4a3021" },
        { at: 0.5, color: "#2b1b13" },
        { at: 1, color: "#160f0b" },
      ], "grain"),
      overlay: "rgba(18, 9, 4, 0.2)",
    }),
    colors: DARK_COLORS,
    preview: "repeating-linear-gradient(165deg, #513523 0 8px, #2d1c13 9px 17px, #1a110c 18px 22px)",
  }),
]);

export const SOLID_COLORS = Object.freeze([
  Object.freeze({ id: "black", name: "ブラック", value: "#111111" }),
  Object.freeze({ id: "dark-gray", name: "ダークグレー", value: "#2b2b2b" }),
  Object.freeze({ id: "navy", name: "ネイビー", value: "#111d36" }),
  Object.freeze({ id: "purple", name: "パープル", value: "#2d173d" }),
  Object.freeze({ id: "dark-green", name: "ダークグリーン", value: "#142d25" }),
  Object.freeze({ id: "brown", name: "ブラウン", value: "#36251d" }),
  Object.freeze({ id: "white", name: "ホワイト", value: "#f5f2ec" }),
]);

function parseHexColor(hex) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return { r: 21, g: 18, b: 15 };
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function createSolidTheme(color) {
  const { r, g, b } = parseHexColor(color);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const light = luminance > 0.58;

  return {
    id: `solid-${color}`,
    name: "単色",
    type: "solid",
    paint: { kind: "solid", color },
    colors: {
      text: light ? "#201d19" : "#fffaf3",
      muted: light ? "#5e574e" : "#d6ccc0",
      accent: light ? "#6e4f21" : "#e0b970",
      cardSurface: light ? "#e5e0d8" : "#11100e",
      placeholder: light ? "#ddd7ce" : "#2b2926",
      cardBorder: light ? "rgba(56,43,25,0.42)" : "rgba(224,185,112,0.5)",
      cardHalo: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.045)",
      textShadow: light ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.72)",
    },
  };
}

export function resolveBackgroundTheme(background) {
  if (background.mode === "solid") return createSolidTheme(background.solidColor);
  return PRESET_THEMES.find((theme) => theme.id === background.presetId) ?? PRESET_THEMES[0];
}
