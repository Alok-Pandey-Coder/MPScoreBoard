/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        editorial: {
          bg: '#0C1017',
          surface: '#131923',
          card: '#18202E',
          cardHover: '#1E2838',
          border: '#232D3E',
          borderSubtle: '#1C2433',
          muted: '#8C98A9',
          lightMuted: '#6B7280',
          accent: '#E6A23C',
          brass: '#F59E0B',
          amberDark: '#B45309',
          parliament: '#3B82F6',
          ink: '#0F172A',
        },
        civic: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        editorial: '0.04em',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        elevated: '0 10px 30px -4px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
