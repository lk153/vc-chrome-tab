/**
 * Material 3 (Emerald · Expressive). Colour roles map to the `--m-*` CSS
 * variables in src/styles/globals.css; dark mode swaps the variables, so every
 * utility (bg-primary, text-on-surface, bg-surface-container-high …) is
 * theme-aware automatically. A few legacy names are aliased to M3 roles so any
 * not-yet-restyled markup still resolves.
 *
 * @type {import('tailwindcss').Config}
 */
const role = (name) => `rgb(var(--m-${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./newtab.html", "./popup.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: role("primary"),
        "on-primary": role("on-primary"),
        "primary-container": role("primary-container"),
        "on-primary-container": role("on-primary-container"),
        secondary: role("secondary"),
        "on-secondary": role("on-secondary"),
        "secondary-container": role("secondary-container"),
        "on-secondary-container": role("on-secondary-container"),
        tertiary: role("tertiary"),
        "on-tertiary": role("on-tertiary"),
        "tertiary-container": role("tertiary-container"),
        "on-tertiary-container": role("on-tertiary-container"),
        error: role("error"),
        "on-error": role("on-error"),
        "error-container": role("error-container"),
        "on-error-container": role("on-error-container"),
        surface: role("surface"),
        "surface-dim": role("surface-dim"),
        "surface-bright": role("surface-bright"),
        "surface-container-lowest": role("surface-container-lowest"),
        "surface-container-low": role("surface-container-low"),
        "surface-container": role("surface-container"),
        "surface-container-high": role("surface-container-high"),
        "surface-container-highest": role("surface-container-highest"),
        "on-surface": role("on-surface"),
        "on-surface-variant": role("on-surface-variant"),
        outline: role("outline"),
        "outline-variant": role("outline-variant"),
        "inverse-surface": role("inverse-surface"),
        "inverse-on-surface": role("inverse-on-surface"),
        "inverse-primary": role("inverse-primary"),
        scrim: role("scrim"),

        // Legacy aliases → M3 roles (kept so older markup still resolves).
        ink: role("on-surface"),
        muted: role("on-surface-variant"),
        faint: role("outline"),
        line: role("outline-variant"),
        panel: role("surface-container"),
        canvas: role("surface"),
        brand: role("primary"),
        "brand-soft": role("primary-container"),
      },
      borderRadius: {
        "m3-xs": "4px",
        "m3-sm": "8px",
        "m3-md": "12px",
        "m3-lg": "16px",
        "m3-xl": "28px",
      },
      boxShadow: {
        "m3-1": "0 1px 2px rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15)",
        "m3-2": "0 1px 2px rgb(0 0 0 / 0.30), 0 2px 6px 2px rgb(0 0 0 / 0.15)",
        "m3-3": "0 4px 8px 3px rgb(0 0 0 / 0.15), 0 1px 3px rgb(0 0 0 / 0.30)",
        card: "0 1px 2px rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15)",
      },
      fontFamily: {
        sans: [
          "Roboto",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
