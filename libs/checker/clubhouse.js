/*
  Clubhouse strategy
  commit message should start from symbols 'ch' and clubhouse story id
  pattern 'ch4583'
  in this case script will analyze clubhouse story type
  for now we don't have strong rules for bump major version
  so, if story type is bug we should bump patch
  for features and chores we should bump minor
  examples:
    'ch4895: sample bug ticket for semantic release automation'
    'ch4991: sample feature ticket for semantic release automation'
    'ch4992: sample chore ticket for semantic release automation'
*/

const clubhouse = require('clubhouse-lib');
const createDebug = require('debug');

const error = createDebug('semantic-release:checker:error');
const clubhouseToken = process.env.CLUBHOUSE_TOKEN;
const clubhouseClient = clubhouse.create(clubhouseToken);
const ticketNumberPattern = /CH\d+/;

const getBumpType = item => clubhouseClient.getStory(item.substring(2, item.length))
  .then(({ story_type }) => (story_type === 'bug' ? 'patch' : 'minor'))
  .catch((err) => {
    error(`Error while get info about story ${item}`, err.message);
  });

module.exports = {
  hasVersionChanges: (message) => {
    const msg = message.toUpperCase();
    if (!ticketNumberPattern.test(msg)) {
      return null;
    }
    const result = msg.match(ticketNumberPattern);
    return result[0] ? result[0] : null;
  },
  // bump method returns 'patch' or 'minor' or false (for default predefined bump method)
  getBumpType,
  getBumpMethod: async (commits) => {
    try {
      return (await Promise.all(commits
        .filter(item => !!item)
        .map(item => getBumpType(item))))
        .filter(item => !!item)
        .reduce((method, currentType) => {
          error('method', method);
          if (!method) {
            return currentType;
          }
          if (method === 'patch' && currentType !== method) {
            return currentType;
          }
          return method;
        }, false);
    } catch (error) {
      return false;
    }
  },
};
