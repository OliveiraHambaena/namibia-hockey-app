const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Configure Metro to properly handle tempo-devtools and tempobook dynamic files
config.resolver = {
  ...config.resolver,
  // Exclude tempo-devtools and tempobook dynamic files from Metro bundling
  blockList: [
    // Exclude all files in the tempo-devtools package
    new RegExp(`node_modules[\\/]tempo-devtools[\\/].*`),
    // Exclude tempobook dynamic files that might cause ENOENT errors
    new RegExp(`app[\\/]tempobook[\\/]dynamic[\\/].*`),
    // Exclude anonymous files that might cause ENOENT errors
    new RegExp(`<anonymous>`),
  ],
  // Provide an empty module for tempo-devtools during bundling
  extraNodeModules: {
    "tempo-devtools": path.resolve(__dirname, "./empty-module.js"),
  },
};

// Ensure tempo-devtools is excluded from the bundle
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Add watchFolders configuration to exclude tempobook/dynamic
config.watchFolders = config.watchFolders || [];

module.exports = withNativeWind(config, { input: "./global.css" });
