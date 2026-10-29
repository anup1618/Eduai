/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Semantic Theme Tokens
        bg: 'var(--bg)',
        sidebar: 'var(--sidebar)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-contrast': 'var(--accent-contrast)',

        // Brand Palette
        brand: {
          mint: '#2AF5C8',
          carbon: '#141414',
          royal: '#014BAA',
          cream: '#F8F3F0',
        },

        // Watermelon UI Palette
        watermelon: {
          red: '#FF3B5C',
          pink: '#FF6584',
          coral: '#FF4D6D',
          rind: '#059669',
          mint: '#10B981',
          emerald: '#00D68F',
          seed: '#0F172A',
        },

        // Status Colors
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },

        // Chart Tokens
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
          6: 'var(--chart-6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'spec-card': '20px',
        'spec-sidebar': '22px',
        'spec-btn': '12px',
        'spec-chip': '10px',
      },
      boxShadow: {
        'spec-card': 'var(--shadow-card)',
        'spec-hover': 'var(--shadow-card-hover)',
        'spec-glow': '0 0 24px var(--accent-glow)',
      },
      letterSpacing: {
        'spec-label': '0.08em',
      },
    },
  },
  plugins: [],
}
