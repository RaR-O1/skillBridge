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
        brand: {
          DEFAULT: '#4B2FC4',
          hover: '#3D25A3',
          light: '#EDE9FE',
          dark: '#351F91',
        },
        success: {
          DEFAULT: '#1F8A47',
          light: '#DCFCE7',
          dark: '#166534',
        },
        warning: {
          DEFAULT: '#F08A24',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        accentBlue: {
          DEFAULT: '#2F6FE4',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        danger: {
          DEFAULT: '#D64545',
          light: '#FEE2E2',
          dark: '#991B1B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        button: '8px',
        card: '12px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      }
    },
  },
  plugins: [],
}
