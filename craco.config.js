module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // The new visual-embed-sdk uses "type": "module" (ESM) in its lib/ build,
      // which requires fully-specified file extensions that webpack can't resolve.
      // Setting fullySpecified: false allows webpack to resolve these imports.
      webpackConfig.module.rules.push({
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      });
      return webpackConfig;
    },
  },
};
