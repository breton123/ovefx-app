/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			fontFamily: {
				DM: ["Plus Jakarta Sans", "sans-serif"],
				mona: ["Work Sans", "sans-serif"],
			},
			colors: {
				transparent: "transparent",
				current: "currentColor",
				color1: "#101935",
				color2: "#343B4F",
				color3: "#57C3FF",
				color4: "#9A91FB",
				color5: "#FDB52A",
				primary: "#6C72FF",
				neutral1: "#080F25",
				neutral2: "#212C4D",
				neutral3: "#37446B",
				neutral4: "#7E89AC",
				neutral5: "#AEB9E1",
				neutral6: "#D1DBF9",
				neutral7: "#D9E1FA",
				neutral8: "#FFFFFF",
			},
		},
	},
	plugins: [],
};
