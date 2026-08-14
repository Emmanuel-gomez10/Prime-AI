/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-color) / <alpha-value>)',
        surface: 'rgb(var(--surface-color) / <alpha-value>)',
        'primary-text': 'rgb(var(--text-primary) / <alpha-value>)',
        'secondary-text': 'rgb(var(--text-secondary) / <alpha-value>)',
        textPrimary: 'rgb(var(--text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        divider: 'rgb(var(--border-color) / 0.1)',
        'card-hover': 'rgb(var(--card-hover) / 0.05)',
        primary: '#a855f7',
        secondary: '#8b5cf6',
        accent: '#41E5FF',
      },
      borderRadius: {
        card: '24px',
        button: '20px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
