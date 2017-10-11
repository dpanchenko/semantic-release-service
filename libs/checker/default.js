/*
  Default strategy
  commit message should start from predefined keys BUG, FEATURE, MAJOR
  examples:
    'BUG: fixed incorrect user name'
    'FEATURE: hide all used car for VannYorkToyota'
    'MAJOR: fully new auth mechanism'
*/

const messageMap = {
  BUG: 'patch',
  FEATURE: 'minor',
  MAJOR: 'major',
};
const messagePattern = new RegExp(`^${Object.keys(messageMap).join('|')}`);

const hasVersionChanges = (message) => {
  const msg = message.toUpperCase();
  if (!messagePattern.test(msg)) {
    return null;
  }
  const result = msg.match(messagePattern);
  return result[0] ? result[0] : null;
};

const getBumpType = (item) => {
  const versionChange = hasVersionChanges(item);
  if (versionChange) {
    return messageMap[versionChange];
  }
  return null;
};

const getBumpMethod = async commits => commits
  .filter(item => !!item)
  .map(item => getBumpType(item))
  .filter(item => !!item)
  .reduce((method, currentType) => {
    if (!method) {
      return currentType;
    }
    if (method === 'patch' && currentType !== method) {
      return currentType;
    }
    if (method === 'minor' && currentType === 'major') {
      return currentType;
    }
    return method;
  }, false);

module.exports = {
  hasVersionChanges,
  getBumpType,
  getBumpMethod,
};
