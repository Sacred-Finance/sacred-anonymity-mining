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
  content: ['./node_modules/flowbite-react/**/*.js', './pages/**/*.{ts,tsx}', './public/**/*.html'],

  theme: {
    screens: {
      xs: '320px',
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      gray: colors.coolGray,
      primary: colors.sky,
      blue: colors.lightBlue,
      red: colors.rose,
      pink: colors.fuchsia,
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
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
      maxWidth: {
        xss: '16rem',
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

      // 50
      // F6F4FE
      // 100
      // EEEBFC
      // 200
      // DFD9FB
      // 300
      // C8BAF8
      // 400
      // AC93F2
      // 500
      // 9167EB
      // 600
      // 8146E0
      // 700
      // 7235CC
      // 800
      // 5F2CAB
      // 900
      // 4F268C
      // 950
      // 31165F
      colors: ({ colors }) => ({
        ...colors,
        'primary-50': '#f6f4fe',
        'primary-100': '#eeebfc',
        'primary-200': '#dfd9fb',
        'primary-300': '#c8baf8',
        'primary-400': '#ac93f2',
        'primary-500': '#9167eb',
        'primary-600': '#8146e0',
        'primary-700': '#7235cc',
        'primary-800': '#5f2cab',
        'primary-900': '#4f268c',
        'primary-950': '#31165f',
        'dark:primary-50': '#1f1f1f',
        'dark:primary-100': '#2f2f2f',
        'dark:primary-200': '#3f3f3f',
        'dark:primary-300': '#4f4f4f',
        'dark:primary-400': '#5f5f5f',
        'dark:primary-500': '#6f6f6f',
        'dark:primary-600': '#7f7f7f',
        'dark:primary-700': '#8f8f8f',
        'dark:primary-800': '#9f9f9f',
        'dark:primary-900': '#afafaf',
        'dark:primary-950': '#bfbfbf',
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
    require('flowbite/plugin'),
  ],
}
