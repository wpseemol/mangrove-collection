/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primaryColor: '#74E291',
                loadingBgColor: '#f4f5f6',
            },
        },
    },
    plugins: [
        require('tailwindcss-animated'),
        function ({ addUtilities }) {
            addUtilities({
                '.appearance-none': {
                    '-webkit-appearance': 'none',
                    '-moz-appearance': 'none',
                    appearance: 'none',
                },
            });
        },
    ],
};
