/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)" /* salmon */,
        "primary-dark": "var(--color-primary-dark)" /* mörkare salmon */,
        highlight: "var(--color-highlight)" /* ljusare salmon */,
        bg: "var(--color-bg)" /* väldigt ljus salmon bakgrund */,
        "bg-alt": "var(--color-bg-alt)" /* blek salmon alt */,
        text: "var(--color-text)" /* nästan svart-röd text */,
        heading: "var(--color-heading)" /* mörk rubrik */,
        link: "var(--color-link)" /* salmon länkar */,
        border: "var(--color-border)" /* ljus salmon kant */,
        success: "var(--color-success)" /* ljus salmon success */,
        error: "var(--color-error)" /* röd-salmon error */,
        warning: "var(--color-warning)" /* orange-salmon warning */,
      },
    },
  },
  plugins: [],
};

// import type { Config } from 'tailwindcss';

// const config: Config = {
//   content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
//   //   safelist: ['text-white', 'bg-kovaad-red', 'font-sans', 'font-helvetica'],
//   theme: {
//     extend: {
//       fontFamily: {
//         // sans: ['Helvetica', 'sans-serif'],
//         // twemoji: ['var(--font-twemoji_mozilla)', 'sans-serif'],
//       },
//       colors: {
//         primary: 'var(--color-primary)' /* salmon */,
//         'primary-dark': 'var(--color-primary-dark)' /* mörkare salmon */,
//         highlight: 'var(--color-highlight)' /* ljusare salmon */,
//         bg: 'var(--color-bg)' /* väldigt ljus salmon bakgrund */,
//         'bg-alt': 'var(--color-bg-alt)' /* blek salmon alt */,
//         text: 'var(--color-text)' /* nästan svart-röd text */,
//         heading: 'var(--color-heading)' /* mörk rubrik */,
//         link: 'var(--color-link)' /* salmon länkar */,
//         border: 'var(--color-border)' /* ljus salmon kant */,
//         success: 'var(--color-success)' /* ljus salmon success */,
//         error: 'var(--color-error)' /* röd-salmon error */,
//         warning: 'var(--color-warning)' /* orange-salmon warning */,
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;
