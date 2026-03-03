/** @type {import('next').NextConfig} */
const nextConfig = {
	turbopack: {
		root: import.meta.dirname,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
			},
			{
				protocol: "https",
				hostname: "via.placeholder.com",
			},
		],
	},
};

export default nextConfig;