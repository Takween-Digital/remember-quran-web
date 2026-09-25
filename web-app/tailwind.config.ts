import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        // Quranic fonts
        uthmani: ['var(--font-uthmani, "UthmanicHafs")', { fontFeatureSettings: '"ss01" on' }],
        'kfgqpc-v2': ['var(--font-kfgqpc-v2, "KFGQPC Uthmanic Script")', { fontFeatureSettings: '"ss01" on' }],
        // Arabic fonts
        amiri: ['var(--font-amiri)', 'sans-serif'],
        'amiri-quran': ['var(--font-amiri-quran)', 'serif'],
        'noto-naskh': ['var(--font-noto-naskh)', 'sans-serif'],
        // Latin fonts
        serif: ['var(--font-newsreader)', 'serif'],
        sans: ['var(--font-public-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
} satisfies Config
