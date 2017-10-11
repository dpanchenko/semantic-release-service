const createDebug = require('debug');
const loader = require('../loader');

const log = createDebug('semantic-release:checker:info');
const DEFAULT_STRATEGY = 'default';

const checkers = loader({
  dirname: __dirname,
  helpstring: 'checker',
});

if (!checkers[DEFAULT_STRATEGY]) {
  throw new Error('Can\'t find default strategy');
}

module.exports = {
  run: (commitMessages, strategy) => {
    if (!checkers[strategy]) {
      log(`Strategy ${strategy} not exist. Forced toy use default strategy.`);
    }
    const currentChecker = checkers[strategy] || checkers[DEFAULT_STRATEGY];
    const commits = commitMessages.map(commit => currentChecker.hasVersionChanges(commit)).filter(item => !!item);
    return currentChecker.getBumpMethod(commits);
  },
  get: (strategy) => {
    if (!checkers[strategy]) {
      log(`Strategy ${strategy} not exist. Forced to use default strategy.`);
    }
    return checkers[strategy] || checkers[DEFAULT_STRATEGY];
  },
};
