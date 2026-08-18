/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./*.html",
  ],
  theme: {
    extend: {
      // -------- Colors (all mapped to CSS variables) --------
      colors: {
        canvas: {
          default: 'var(--color-canvas-default)',
          inset: 'var(--color-canvas-inset)',
          subtle: 'var(--color-canvas-subtle)',
          overlay: 'var(--color-canvas-overlay)',
          elevated: 'var(--color-canvas-elevated)',
        },
        fg: {
          default: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
          'on-emphasis': 'var(--color-fg-on-emphasis)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-fg)',
          fg: 'var(--color-accent-fg)',
          emphasis: 'var(--color-accent-emphasis)',
          muted: 'var(--color-accent-muted)',
          subtle: 'var(--color-accent-subtle)',
          hover: 'var(--color-accent-hover)',
        },
        success: {
          DEFAULT: 'var(--color-success-fg)',
          fg: 'var(--color-success-fg)',
          emphasis: 'var(--color-success-emphasis)',
          muted: 'var(--color-success-muted)',
          subtle: 'var(--color-success-subtle)',
          hover: 'var(--color-success-hover)',
        },
        warning: {
          DEFAULT: 'var(--color-warning-fg)',
          fg: 'var(--color-warning-fg)',
          emphasis: 'var(--color-warning-emphasis)',
          muted: 'var(--color-warning-muted)',
          subtle: 'var(--color-warning-subtle)',
          hover: 'var(--color-warning-hover)',
        },
        danger: {
          DEFAULT: 'var(--color-danger-fg)',
          fg: 'var(--color-danger-fg)',
          emphasis: 'var(--color-danger-emphasis)',
          muted: 'var(--color-danger-muted)',
          subtle: 'var(--color-danger-subtle)',
          hover: 'var(--color-danger-hover)',
        },
        info: {
          DEFAULT: 'var(--color-info-fg)',
          fg: 'var(--color-info-fg)',
          emphasis: 'var(--color-info-emphasis)',
          muted: 'var(--color-info-muted)',
          subtle: 'var(--color-info-subtle)',
          hover: 'var(--color-info-hover)',
        },
        done: {
          DEFAULT: 'var(--color-done-fg)',
          fg: 'var(--color-done-fg)',
          emphasis: 'var(--color-done-emphasis)',
          muted: 'var(--color-done-muted)',
          subtle: 'var(--color-done-subtle)',
          hover: 'var(--color-done-hover)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          'subtle-hover': 'var(--color-border-subtle-hover)',
          muted: 'var(--color-border-muted)',
          default: 'var(--color-border-default)',
          'default-hover': 'var(--color-border-default-hover)',
          hard: 'var(--color-border-hard)',
          'hard-hover': 'var(--color-border-hard-hover)',
          accent: 'var(--color-border-accent)',
          'accent-muted': 'var(--color-border-accent-muted)',
          success: 'var(--color-border-success)',
          'success-muted': 'var(--color-border-success-muted)',
          danger: 'var(--color-border-danger)',
          'danger-muted': 'var(--color-border-danger-muted)',
          warning: 'var(--color-border-warning)',
          'warning-muted': 'var(--color-border-warning-muted)',
        },
      },

      // -------- Spacing (mapped to your --space-* variables) --------
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
      },

      // -------- Border Radius --------
      borderRadius: {
        1: 'var(--radius-1)',
        2: 'var(--radius-2)',
        3: 'var(--radius-3)',
        4: 'var(--radius-4)',
        full: 'var(--radius-full)',
      },

      // -------- Box Shadows --------
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },

      // -------- Font Families --------
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },

      // -------- Transitions (optional) --------
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
      },

      // -------- Layout (custom size tokens) --------
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      height: {
        header: 'var(--header-height)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};