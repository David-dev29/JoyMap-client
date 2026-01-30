/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Paleta principal - Rojo JoyMap
        primary: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#E53935', // Principal
          600: '#D32F2F',
          700: '#C62828', // Oscuro
          800: '#B71C1C',
          900: '#8B0000',
        },
        // Alias para uso más semántico
        brand: {
          DEFAULT: '#E53935',
          light: '#EF5350',
          dark: '#C62828',
          darker: '#B71C1C',
        },
        // Grises personalizados
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#EEEEEE',
        },
        // Texto
        content: {
          primary: '#212121',
          secondary: '#757575',
          tertiary: '#9E9E9E',
          inverse: '#FFFFFF',
        },
        // Estados
        success: {
          DEFAULT: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C',
        },
        warning: {
          DEFAULT: '#FFC107',
          light: '#FFD54F',
          dark: '#FFA000',
        },
        error: {
          DEFAULT: '#F44336',
          light: '#E57373',
          dark: '#D32F2F',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'up': '0 -2px 8px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
