/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant Natural Olive Green Palette
        olive: {
          50: '#F4F7EE',  // softest olive tint
          100: '#E4ECD7', // light sage olive
          200: '#C9DAB2',
          300: '#A8C385',
          400: '#86A95B',
          500: '#6B8E23', // vivid olive green
          600: '#556B2F', // signature dark olive green
          700: '#445626', // rich deep olive
          800: '#33411D', // dark forest olive
          900: '#253015',
          950: '#171F0C',
        },
        // Rich Timber / Teak Dark Brown Palette
        brown: {
          50: '#FAF7F2',  // warm linen white
          100: '#F2EAE0', // soft timber cream
          200: '#E2D2C0', // warm subtle border
          300: '#CFB79E',
          400: '#B59576',
          500: '#947352',
          600: '#745439', // warm teak wood
          700: '#553A26', // rich walnut brown
          800: '#3E2718', // deep solid timber brown
          900: '#2D1A0E', // dark espresso brown
          950: '#1C1008', // near-black timber
        },
        // Direct aliasing so any neutral-* class converts to Dark Brown & Warm Linen
        neutral: {
          50: '#FAF7F2',  // warm linen white
          100: '#F2EAE0', // soft timber cream
          200: '#E2D2C0', // warm subtle border
          300: '#CFB79E',
          400: '#B59576',
          500: '#8A7156',
          600: '#68503A',
          700: '#553A26', // rich walnut
          800: '#3E2718', // solid dark timber brown
          900: '#2D1A0E', // dark espresso brown
          950: '#1C1008',
        },
        brand: {
          olive: '#556B2F',
          brown: '#2D1A0E',
          white: '#FFFFFF',
          linen: '#FAF7F2',
        },
        surface: {
          pure: '#FFFFFF',
          subtle: '#FAF7F2',
          muted: '#F2EAE0',
          border: '#E2D2C0',
          dark: '#2D1A0E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
