const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const previousCwd = process.cwd();
process.chdir(__dirname);
const withCss = withNativewind(config);
process.chdir(previousCwd);

module.exports = withCss;
