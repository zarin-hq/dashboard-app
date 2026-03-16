/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    extend: {
      colors: {
        white: '#FFFFFF',
        deep: {
          DEFAULT: '#264A50',
          dark: '#153439',
          light: '#335C63',
          muted: '#7C8E8E',
        },
        orange: {
          DEFAULT: '#FFB584',
          dark: '#FAA46A',
          light: '#FFC198',
        },
        sky: {
          DEFAULT: '#84D7DC',
          dark: '#2FB2B8',
          light: '#9BEFF4',
        },
        tan: {
          DEFAULT: '#E4D5C3',
          dark: '#BCAB96',
          light: '#FAEFE1',
        },
        sand: {
          DEFAULT: '#FCF3EB',
          dark: '#F2E6DB',
          light: '#FFFAF5',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'Arial', 'sans-serif'],
        heading: ['"Instrument Sans"', 'sans-serif'],
        marketing: ['"Nib Pro"', 'serif'],
      },
    },
  },
  plugins: [],
}
