/** Consumer apps use the same setting — library ships source for last-mile compilation. */
const nextConfig = {
  transpilePackages: [
    "@myproject/core",
    "@myproject/foundations",
    "@myproject/icons",
  ],
};
module.exports = nextConfig;
