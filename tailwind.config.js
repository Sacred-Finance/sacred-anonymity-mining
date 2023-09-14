const defaultTheme = require('tailwindcss/defaultTheme')

const colors = [
  { color: 'transparent', className: 'border-transparent' },
  { color: 'rose-500', className: 'border-rose-500' },
  { color: 'pink-500', className: 'border-pink-500' },
  { color: 'fuchsia-500', className: 'border-fuchsia-500' },
  { color: 'purple-500', className: 'border-purple-500' },
  { color: 'violet-500', className: 'border-violet-500' },
  { color: 'indigo-500', className: 'border-indigo-500' },
  { color: 'blue-500', className: 'border-blue-500' },
  { color: 'sky-500', className: 'border-sky-500' },
  { color: 'cyan-500', className: 'border-cyan-500' },
  { color: 'teal-500', className: 'border-teal-500' },
  { color: 'emerald-500', className: 'border-emerald-500' },
  { color: 'green-500', className: 'border-green-500' },
  { color: 'lime-500', className: 'border-lime-500' },
  { color: 'yellow-500', className: 'border-yellow-500' },
  { color: 'amber-500', className: 'border-amber-500' },
  { color: 'orange-500', className: 'border-orange-500' },
  { color: 'red-500', className: 'border-red-500' },
  { color: 'slate-500', className: 'border-slate-500' },
  { color: 'black', className: 'border-black' },
  { color: 'white', className: 'border-white' },
  { color: 'gray-500', className: 'border-gray-500' },
]

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderColor: theme => {
        const borderColor = {}
        colors.forEach(({ color }) => {
          borderColor[color] = theme(`backgroundColor.${color}`)
        })
        return borderColor
      },
      boxShadow: {
        md: '0 0 10px rgba(138, 81, 74, 0.15)',
      },
      fontSize: {
        'xss': ['0.65rem', { lineHeight: '1rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.2rem' }],
        'base': ['0.9375rem', { lineHeight: '1.4rem' }],
        'lg': ['1.125rem', { lineHeight: '2rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '3rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      maxWidth:{
        'xss': '16rem',
      },

      animation: {
        'fade-in': 'fade-in 0.5s linear forwards',
        'marquee': 'marquee var(--marquee-duration) linear infinite',
        'spin-slow': 'spin 4s linear infinite',
        'spin-slower': 'spin 6s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'spin-reverse-slow': 'spin-reverse 4s linear infinite',
        'spin-reverse-slower': 'spin-reverse 6s linear infinite',
        'pulse-slow': 'pulse 4s linear infinite',
      },
      colors: ({ colors }) => ({
        ...colors,
        'primary-100': '#e6d9ff',
        'primary-200': '#ccb3ff',
        'primary-300': '#b38cff',
        'primary-400': '#9966ff',
        'primary-500': '#8146e0',
        'primary-600': '#6d3cc4',
        'primary-700': '#5e33a9',
        'primary-800': '#512a8f',
        'primary-900': '#462177',
        'primary-1000': '#3b1a5f',
        'primary-bg': '#8146e0',
        'primary-text': '#ffffff',
        'primary-border': '#e6d9ff',
        'primary-hover': '#6d3cc4',

        'primary-dark': '#b39ddb',
        'primary-light': '#8146e0',
        'secondary-dark': '#7986cb',
        'background-dark': '#121212',
        'on-dark-high-emphasis': '#ffffffe6',
        'on-dark-medium-emphasis': '#ffffff99',
        'on-dark-disabled': '#ffffff61',
        'on-light-high-emphasis': '#000000de',
        'on-light-medium-emphasis': '#00000099',
        'on-light-disabled': '#00000061',
        'border-on-dark': '#ffffff1f',
        'content-on-dark-disabled': '#ffffff61',
        'error-dark': '#cf6679',
        'error': colors.red,
        'accent-dark': '#c5cae9',
        'gray': { ...colors.zinc },
        // 'primary': colors.sky,
        // 'secondary': colors.emerald,
        // 'tertiary': colors.sky,
        // 'danger': colors.red,

        'graySlate': {
          50: 'f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'grayNew': {
          100: '#F7F9F8',
          200: '#D7D8DC',
          300: '#8B8F98',
          400: '#62676D',
          500: '#313236',
          600: '#2E3540',
          700: '#222833',
          800: '#141B26',
          900: '#090E1A',
        },
        'grayLinear': {
          100: '#F7F9F8',
          200: '#D7D8DC',
          300: '#8B8F98',
          400: '#62676D',
          500: '#313236',
          600: '#27282C',
          700: '#222325',
          800: '#1F2024',
          900: '#1C1D1F',
        },

        'ethereum': '#617FEA',
        'gnosis': '#00A1B8',
        'polygon': '#8247E5',
        'arbitrum': '#28A0F0',
        'fantom': '#25B6EA',
        'avalanche': '#E84142',
      }),
      opacity: {
        1: '0.01',
        2.5: '0.025',
        5.0: '0.05',
        7.5: '0.075',
        15: '0.15',
      },
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'fade-in': {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        'marquee': {
          '100%': {
            transform: 'translateY(-50%)',
          },
        },
        'spin-reverse': {
          to: {
            transform: 'rotate(-360deg)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
