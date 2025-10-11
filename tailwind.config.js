/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_layouts/**/*.html',
    './_includes/**/*.html',
    './_posts/**/*.{md,markdown}',
    './*.{html,md,markdown}',
    './assets/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors here
      },
      fontFamily: {
        // Add custom fonts here
      },
    },
  },
  plugins: [],
}

