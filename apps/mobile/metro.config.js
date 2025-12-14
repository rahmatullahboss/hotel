// Use the local @expo/metro-config package
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This points to the root of the monorepo
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages - mobile app first, then root
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
