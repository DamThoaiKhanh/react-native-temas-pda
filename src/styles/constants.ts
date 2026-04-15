export const colors = {
  primary: "#1565C0",
  primaryLight: "#E3F2FD",
  primaryBorder: "#90CAF9",

  background: "#F8FAFC",
  surface: "#fff",
  surfaceSelected: "#E3F2FD",

  textPrimary: "#333",
  textSecondary: "#555",
  textMuted: "#888",
  textInverse: "#fff",

  border: "#eee",
  borderLight: "#f0f0f0",

  shadow: "#000",
};

export const fontSize = {
  xs: 11, // badge
  sm: 13, // card subtitle
  md: 14, // body text
  base: 16, // default / button text
  lg: 18, // sub heading
  xl: 20, // heading
  xxl: 24, // section title / screen title
};

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const typography = {
  sectionTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  cardSub: { fontSize: fontSize.sm },
  badge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
  "2xl": 16,
  "3xl": 20,
  full: 9999,
};
