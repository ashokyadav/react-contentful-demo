import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["./*.mdx", "../packages/*/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: { name: "@storybook/nextjs", options: {} },
  staticDirs: [{ from: "../../img", to: "/catalog" }],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: "react-docgen-typescript" },

  /**
   * Last-mile compilation. @storybook/nextjs already compiles TS via SWC
   * for local workspace packages; this rule also covers them when installed from the registry.
   */
  webpackFinal: async (config) => {
    const transpilePackages = ["@myproject/core", "@myproject/foundations", "@myproject/icons"];
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: (filePath: string) => {
        const normalized = filePath.replace(/\\/g, "/");
        return transpilePackages.some((pkg) => normalized.includes(pkg))
          || /\/packages\/(core|foundations|icons)\//.test(normalized);
      },
      loader: require.resolve("swc-loader"),
      options: { jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } } },
    } as never);
    config.resolve = config.resolve || {};
    config.resolve.extensions = Array.from(new Set([...(config.resolve.extensions || []), ".ts", ".tsx", ".js", ".jsx"]));
    return config;
  },
};
export default config;
