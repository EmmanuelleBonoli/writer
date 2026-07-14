const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// lucide-react-native (et d'autres libs ESM) sont distribuées en .mjs, non reconnu par Metro par défaut.
config.resolver.sourceExts.push('mjs');

module.exports = config;
