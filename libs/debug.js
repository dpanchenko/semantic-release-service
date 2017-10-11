const createDebug = require('debug');

module.exports = scope => ({
  log: createDebug(`semantic-release:${scope}:log`),
  error: createDebug(`semantic-release:${scope}:error`),
});
