const github = require('octonode');
const checker = require('./checker');
const bumper = require('./bumper');
const { log, error } = require('./debug')('processor');

const gitProtocol = process.env.GIT_PROTOCOL;
const gitToken = process.env.GIT_TOKEN;
const gitUser = process.env.GIT_USER;
const gitUserName = process.env.GIT_USER_NAME;
const gitUserEmail = process.env.GIT_USER_EMAIL;

const semanticStrategy = process.env.SEMANTIC_STRATEGY;

const checkPullRequest = async ({ data, watch: gitWatchBranch }) => {
  const { action, repository, pull_request: pullRequest } = data;
  const checkerInstance = checker.get(semanticStrategy);
  const gitRepoFullName = repository.full_name;
  log(`Request from repo ${gitRepoFullName}`);
  log(`Watching branch ${gitWatchBranch}`);
  if (pullRequest && pullRequest.base && pullRequest.base.ref !== gitWatchBranch) {
    log(`We don't wanna process ${pullRequest.base.ref} branch. Processing only ${gitWatchBranch} branch`);
    return {};
  }
  if (pullRequest && action === 'closed' && pullRequest.merged) {
    const { title, base, head } = pullRequest;
    log('Merged PR detected');
    log(`${head.ref} >> ${base.ref}: ${title}`);
    log(`Analyze title using '${semanticStrategy}' semantic strategy`);
    const versionMarker = checkerInstance.hasVersionChanges(head.ref);
    if (!versionMarker) {
      log('We didn\'t find any information about version bumping in this PR');
    } else {
      log(`We have information about version bumping in this PR: ${versionMarker}`);
      const bumpMethod = await checkerInstance.getBumpType(versionMarker);
      log(`This PR should be bumped with '${bumpMethod}'`);
      log('Call bumper');
      bumper({ gitToken, gitUser, gitUserName, gitUserEmail, gitRepoFullName, gitProtocol, gitWatchBranch, bumpMethod });
      log('Finished bumper');
    }
  }
  if (pullRequest && action === 'opened') {
    const { number, title, base, head } = pullRequest;
    log('Opened PR detected');
    log(`${head.ref} >> ${base.ref}: ${title}`);
    log(`Analyze head ref using '${semanticStrategy}' semantic strategy`);
    const versionMarker = checkerInstance.hasVersionChanges(head.ref);
    if (!versionMarker) {
      log('We didn\'t find any information about version bumping in this PR');
    } else {
      const updatedPRTitle = `${versionMarker}: ${title}`;
      log(`This PR should have title '${updatedPRTitle}'`);
      const githubClient = github.client(gitToken);
      const ghpr = githubClient.pr(gitRepoFullName, number);
      log(`Got PR number ${ghpr.number} from Github repo ${ghpr.repo}`);
      ghpr.update({ title: updatedPRTitle }, (err) => {
        if (err) {
          return error(`This PR was not updated: ${JSON.stringify(err)}`);
        }
        return log('This PR was updated successfully!');
      });
    }
  }
  return {};
};

module.exports = checkPullRequest;
