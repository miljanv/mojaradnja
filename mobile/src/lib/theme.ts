export const theme = {
  colors: {
    primary: "#E85A6B",
    primaryDark: "#C7435A",
    primarySoft: "#FDECEE",
    bg: "#FFFFFF",
    bgMuted: "#F7F7F9",
    card: "#FFFFFF",
    border: "#ECECF0",
    text: "#17151A",
    textMuted: "#6B6870",
    textFaint: "#9A97A0",
    success: "#1B9C6B",
    danger: "#D6455B",
    white: "#FFFFFF",
    dark: "#17151A",
  },
  radius: { sm: 10, md: 16, lg: 24, pill: 999 },
  space: (n: number) => n * 4,
} as const;

export type Theme = typeof theme;
