import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
} satisfies Config
