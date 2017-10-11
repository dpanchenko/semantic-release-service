const github = require('octonode');
const semverRegex = require('semver-regex');
const checker = require('./libs/checker');
const bumper = require('./libs/bumper');
const { log, error } = require('./libs/debug')('version');

const gitProtocol = process.env.GIT_PROTOCOL;
const gitToken = process.env.GIT_TOKEN;
const gitUser = process.env.GIT_USER;
const gitUserName = process.env.GIT_USER_NAME;
const gitUserEmail = process.env.GIT_USER_EMAIL;
const gitRepoFullName = process.env.GIT_REPO_FULL_NAME;
const gitWatchBranch = process.env.GIT_REPO_WATCH_BRANCH;
const semanticStrategy = process.env.SEMANTIC_STRATEGY;

const isVersionCommit = message => semverRegex().test(message);

const runner = new Promise((resolve, reject) => {
  const githubClient = github.client(gitToken);
  return githubClient.get(`/repos/${gitRepoFullName}/commits`, {}, (err, status, body) => {
    if (err) {
      return reject(err);
    }
    let i = 0;
    const commits = [];
    while (!isVersionCommit(body[i].commit.message) && i < body.length) {
      commits.push(body[i].commit.message);
      i += 1;
    }
    return checker.run(commits, semanticStrategy).then(method => resolve(method)).catch((err) => {
      error(err);
      return reject(err);
    });
  });
});

runner.then((bumpMethod) => {
  if (bumpMethod) {
    log(`need to do: npm version ${bumpMethod}`);
    bumper({ gitToken, gitUser, gitUserName, gitUserEmail, gitRepoFullName, gitProtocol, gitWatchBranch, bumpMethod });
  } else {
    log('nothing to bump');
  }
});

