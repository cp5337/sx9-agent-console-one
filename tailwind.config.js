/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sx: {
          root:     '#0a0e1a',
          surface:  '#121826',
          elevated: '#1a2234',
          border:   '#2a3447',
          hover:    '#1e2a40',
          active:   '#253148',
          primary:  '#135BEC',
          glow:     '#60a5fa',
          success:  '#22c55e',
          warning:  '#eab308',
          error:    '#ef4444',
          agent:    '#a855f7',
          text:     '#e5e7eb',
          muted:    '#9ca3af',
          faint:    '#6b7280',
          ok:       '#10b981',
        },
      },
      borderColor: {
        DEFAULT: '#2a3447',
      },
      borderWidth: {
        DEFAULT: '0.5px',
        '0': '0',
        '1': '1px',
        '2': '2px',
        '4': '4px',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
        mono: ["ui-monospace", "'Cascadia Code'", "'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      fontSize: {
        base: ['14px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
};
