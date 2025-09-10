// Jest setup file - configuración básica
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Importar jest-dom para matchers adicionales
require('@testing-library/jest-dom');