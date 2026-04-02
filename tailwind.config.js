/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html", "./assets/**/*.{html,js}"], // Add paths to your HTML files
    theme: {
        extend: {},
    },
    plugins: [],
}
export default {
    theme: {
        extend: {
            fontFamily: {
                instrument: ['"Instrument Sans"', 'sans-serif'],
            },
        },
    },
}
