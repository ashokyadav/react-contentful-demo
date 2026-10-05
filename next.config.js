const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@myproject/core", "@myproject/foundations", "@myproject/icons"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@myproject/core": path.join(__dirname, "library/packages/core/src/index.ts"),
      "@myproject/foundations": path.join(__dirname, "library/packages/foundations"),
      "@myproject/icons": path.join(__dirname, "library/packages/icons/src/index.ts"),
      react: path.join(__dirname, "node_modules/react"),
      "react-dom": path.join(__dirname, "node_modules/react-dom"),
    };
    return config;
  },
};

module.exports = nextConfig;
