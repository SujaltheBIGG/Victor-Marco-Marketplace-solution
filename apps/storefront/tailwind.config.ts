import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        primary: "rgba(var(--bg-primary))",
        secondary: "rgba(var(--bg-secondary))",
        tertiary: "rgba(var(--bg-tertiary))",
        disabled: "rgba(var(--bg-disabled))",
        component: {
          DEFAULT: "rgba(var(--bg-component-primary))",
          hover: "rgba(var(--bg-component-primary-hover))",
          secondary: {
            DEFAULT: "rgba(var(--bg-component-secondary))",
            hover: "rgba(var(--bg-component-secondary-hover))",
          },
        },
        action: {
          DEFAULT: "rgba(var(--bg-action-primary))",
          hover: "rgba(var(--bg-action-primary-hover))",
          pressed: "rgba(var(--bg-action-primary-pressed))",
          secondary: {
            DEFAULT: "var(--bg-action-secondary)",
            hover: "var(--bg-action-secondary-hover)",
            pressed: "var(--bg-action-secondary-pressed)",
          },
          tertiary: {
            DEFAULT: "var(--bg-action-tertiary)",
            hover: "var(--bg-action-tertiary-hover)",
            pressed: "var(--bg-action-tertiary-pressed)",
          },
        },
        positive: {
          DEFAULT: "rgba(var(--bg-positive-primary))",
          hover: "rgba(var(--bg-positive-primary-hover))",
          pressed: "rgba(var(--bg-positive-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-positive-secondary))",
            hover: "rgba(var(--bg-positive-secondary-hover))",
            pressed: "rgba(var(--bg-positive-secondary-pressed))",
          },
        },
        negative: {
          DEFAULT: "rgba(var(--bg-negative-primary))",
          hover: "rgba(var(--bg-negative-primary-hover))",
          pressed: "rgba(var(--bg-negative-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-negative-secondary))",
            hover: "rgba(var(--bg-negative-secondary-hover))",
            pressed: "rgba(var(--bg-negative-secondary-pressed))",
          },
        },
        warning: {
          DEFAULT: "rgba(var(--bg-warning-primary))",
          hover: "rgba(var(--bg-warning-primary-hover))",
          pressed: "rgba(var(--bg-warning-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-warning-secondary))",
            hover: "rgba(var(--bg-warning-secondary-hover))",
            pressed: "rgba(var(--bg-warning-secondary-pressed))",
          },
        },
      },
      colors: {
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          subtle: "var(--color-surface-subtle)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        fg: {
          DEFAULT: "var(--color-fg)",
          secondary: "var(--color-fg-secondary)",
        },
        heading: "var(--color-heading)",
        muted: "var(--color-muted)",
        graphite: {
          DEFAULT: "var(--color-graphite)",
          raised: "var(--color-graphite-raised)",
        },
        "on-graphite": {
          DEFAULT: "var(--color-on-graphite)",
          muted: "var(--color-on-graphite-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent-text)",
          ink: "var(--color-accent-ink)",
        },
        cta: {
          DEFAULT: "var(--color-cta)",
          hover: "var(--color-cta-hover)",
          foreground: "var(--color-cta-ink)",
        },
        success: "var(--color-success)",
        rating: "var(--color-rating)",
        primary: "rgba(var(--content-primary))",
        secondary: "rgba(var(--content-secondary))",
        tertiary: "rgba(var(--content-tertiary))",
        disabled: "rgba(var(--content-disabled))",
        action: {
          DEFAULT: "rgba(var(--content-action-primary))",
          hover: "rgba(var(--content-action-primary-hover))",
          pressed: "rgba(var(--content-action-primary-pressed))",
          on: {
            primary: "rgba(var(--content-action-on-primary))",
            secondary: "rgba(var(--content-action-on-secondary))",
            tertiary: "rgba(var(--content-action-on-tertiary))",
          },
        },
        positive: {
          DEFAULT: "rgba(var(--content-positive-primary))",
          on: {
            primary: "rgba(var(--content-positive-on-primary))",
            secondary: "rgba(var(--content-positive-on-secondary))",
          },
        },
        negative: {
          DEFAULT: "rgba(var(--content-negative-primary))",
          on: {
            primary: "rgba(var(--content-negative-on-primary))",
            secondary: "rgba(var(--content-negative-on-secondary))",
          },
        },
        warning: {
          DEFAULT: "rgba(var(--content-warning-primary))",
          on: {
            primary: "rgba(var(--content-warning-on-primary))",
            secondary: "rgba(var(--content-warning-on-secondary))",
          },
        },
      },
      borderColor: {
        DEFAULT: "rgba(var(--border-primary))",
        primary: "rgba(var(--border-primary))",
        secondary: "rgba(var(--border-secondary))",
        action: "rgba(var(--border-action))",
        negative: {
          DEFAULT: "rgba(var(--border-negative-primary))",
          secondary: "rgba(var(--border-negative-secondary))",
        },
        positive: {
          DEFAULT: "rgba(var(--border-positive-primary))",
          secondary: "rgba(var(--border-positive-secondary))",
        },
        warning: {
          DEFAULT: "rgba(var(--border-warning-primary))",
          secondary: "rgba(var(--border-warning-secondary))",
        },
        disabled: "rgba(var(--border-disabled))",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-2xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        h1: ["2rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h2: ["1.5rem", { lineHeight: "1.4" }],
        h3: ["1.25rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.5" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        ui: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.04em" }],
        eyebrow: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.04em" }],
      },
      maxWidth: {
        "screen-xl": "1280px",
      },
      boxShadow: {
        md: "0 8px 24px rgba(9, 9, 9, 0.12)",
      },
      borderRadius: {
        xs: "0",
        sm: "0",
        md: "0",
        full: "1000px",
      },
      fill: {
        primary: "rgba(var(--content-action-on-primary))",
        secondary: "rgba(var(--content-action-on-secondary))",
        disabled: "rgba(var(--content-disabled))",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    })
  ],
} satisfies Config
