/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	webpack: (config) => {
		config.module.rules.push({
			test: /\.md$/,
			type: "asset/source",
		});
		return config;
	},
};
export default config;
