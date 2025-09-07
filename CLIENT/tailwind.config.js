/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lakshya brand palette - Mint, Green, Teal, Navy with gradients
        primary: {
          50: '#f0fdfa',   // Mint light
          100: '#ccfbf1',  // Mint
          200: '#99f6e4',  // Mint medium
          300: '#5eead4',  // Teal light
          400: '#2dd4bf',  // Teal
          500: '#14b8a6',  // Teal medium
          600: '#0d9488',  // Teal dark
          700: '#0f766e',  // Dark teal
          800: '#115e59',  // Navy teal
          900: '#134e4a',  // Navy dark
        },
        secondary: {
          50: '#ecfdf5',   // Green light
          100: '#d1fae5',  // Green
          200: '#a7f3d0',  // Green medium
          300: '#6ee7b7',  // Green bright
          400: '#34d399',  // Green vivid
          500: '#10b981',  // Green strong
          600: '#059669',  // Green dark
          700: '#047857',  // Forest green
          800: '#065f46',  // Dark green
          900: '#064e3b',  // Deep green
        },
        accent: {
          50: '#f0f9ff',   // Sky light
          100: '#e0f2fe',  // Sky
          200: '#bae6fd',  // Sky medium
          300: '#7dd3fc',  // Light blue
          400: '#38bdf8',  // Blue
          500: '#0ea5e9',  // Blue medium
          600: '#0284c7',  // Blue dark
          700: '#0369a1',  // Navy blue
          800: '#075985',  // Navy
          900: '#0c4a6e',  // Deep navy
        },
        gradient: {
          start: '#f0fdfa',  // Mint start
          middle: '#5eead4', // Teal middle
          end: '#0c4a6e',    // Navy end
        }
      },
      backgroundImage: {
        'gradient-lakshya': 'linear-gradient(135deg, #f0fdfa 0%, #5eead4 50%, #0c4a6e 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
      }
    },
  },
  plugins: [],
}

