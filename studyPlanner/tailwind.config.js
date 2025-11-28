/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'rgb(var(--primary-50) / <alpha-value>)',
                    100: 'rgb(var(--primary-100) / <alpha-value>)',
                    200: 'rgb(var(--primary-200) / <alpha-value>)',
                    300: 'rgb(var(--primary-300) / <alpha-value>)',
                    400: 'rgb(var(--primary-400) / <alpha-value>)',
                    500: 'rgb(var(--primary-500) / <alpha-value>)',
                    600: 'rgb(var(--primary-600) / <alpha-value>)',
                    700: 'rgb(var(--primary-700) / <alpha-value>)',
                    800: 'rgb(var(--primary-800) / <alpha-value>)',
                    900: 'rgb(var(--primary-900) / <alpha-value>)',
                    950: 'rgb(var(--primary-950) / <alpha-value>)',
                },
                // Map slate to our dynamic gray variables
                slate: {
                    50: 'rgb(var(--gray-50) / <alpha-value>)',
                    100: 'rgb(var(--gray-100) / <alpha-value>)',
                    200: 'rgb(var(--gray-200) / <alpha-value>)',
                    300: 'rgb(var(--gray-300) / <alpha-value>)',
                    400: 'rgb(var(--gray-400) / <alpha-value>)',
                    500: 'rgb(var(--gray-500) / <alpha-value>)',
                    600: 'rgb(var(--gray-600) / <alpha-value>)',
                    700: 'rgb(var(--gray-700) / <alpha-value>)',
                    800: 'rgb(var(--gray-800) / <alpha-value>)',
                    900: 'rgb(var(--gray-900) / <alpha-value>)',
                    950: 'rgb(var(--gray-950) / <alpha-value>)',
                },
                secondary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
            },
            fontFamily: {
                sans: ['var(--font-main)', 'Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'blob': 'blob 7s infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
