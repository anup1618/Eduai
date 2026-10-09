/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UI_SPEC design tokens
        page: '#000000',
        panel: '#05070f',
        raised: '#0b1226',
        border: '#14224a',
        blue: {
          accent: '#2f7bff',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        },
        cyan: {
          accent: '#22d3ee',
          400: '#22d3ee',
          300: '#67e8f9',
        },
        // Status colors
        status: {
          green: '#22c55e',
          red: '#ef4444',
          amber: '#f59e0b',
          grey: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'panel-gradient': 'linear-gradient(135deg, #0a1022, #05070f)',
        'btn-primary': 'linear-gradient(135deg, #2563eb, #2f7bff, #22d3ee)',
        'sidebar-active': 'linear-gradient(90deg, rgba(47,123,255,0.2), rgba(34,211,238,0.1))',
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(47, 123, 255, 0.25)',
        'glow-cyan': '0 0 16px rgba(34, 211, 238, 0.2)',
      },
    },
  },
  plugins: [],
}
