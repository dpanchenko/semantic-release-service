const fs = require('fs');
const expandTilde = require('expand-tilde');
const uuid = require('uuid');
const exec = require('child_process').execSync;
const { log, error } = require('./debug')('bumper');

const instanceHash = uuid.v4();
const tmp = expandTilde(`${process.cwd()}/tmp`);

module.exports = ({ gitToken, gitUser, gitUserName, gitUserEmail, gitRepoFullName, gitProtocol, gitWatchBranch, bumpMethod }) => {
  const allowedBumpMethods = ['patch', 'minor', 'major'];
  if (!allowedBumpMethods.indexOf(bumpMethod) === -1) {
    error(`bumpMethod is mandatory and should be one of ${JSON.stringify(allowedBumpMethods)}`);
    return;
  }
  if (!gitToken) {
    error('gitToken is mandatory');
    return;
  }
  if (!gitUser) {
    error('gitUser is mandatory');
    return;
  }
  if (!gitRepoFullName) {
    error('gitRepoFullName is mandatory');
    return;
  }
  if (!gitProtocol) {
    error('gitProtocol is mandatory');
    return;
  }
  if (!gitWatchBranch) {
    error('gitWatchBranch is mandatory');
    return;
  }

  const gitAuth = gitUser ? `${gitUser}:${gitToken}@` : '';
  const repoUrl = `${gitProtocol}${gitAuth}github.com/${gitRepoFullName}.git`;

  log(`Repo: ${repoUrl}`);

  const setupCommand = `git config user.name "${gitUserName}"; git config user.email "${gitUserEmail}"`;
  const cloneCommand = `git clone ${repoUrl} ${instanceHash}`;
  const checkoutCommand = `git checkout ${gitWatchBranch}`;
  const bumpCommand = `npm version ${bumpMethod}`;
  const pushCommand = `git push origin ${gitWatchBranch} && git push --tags`;
  const repoPath = `${tmp}/${instanceHash}`;
  const removeCommand = `rm -rf ${repoPath}`;

  if (!fs.existsSync(tmp)) {
    log(`No temp directory found at: ${tmp}`);
    fs.mkdirSync(tmp);
    log(`Temp directory created: ${tmp}`);
  }

  try {
    log(`Execute ${setupCommand}`);
    exec(setupCommand, { cwd: tmp });
    log(`Execute ${cloneCommand}`);
    exec(cloneCommand, { cwd: tmp });
    log(`Execute ${checkoutCommand}`);
    exec(checkoutCommand, { cwd: repoPath });
    log(`Execute ${bumpCommand}`);
    exec(bumpCommand, { cwd: repoPath });
    log(`Execute ${pushCommand}`);
    exec(pushCommand, { cwd: repoPath });
  } catch (err) {
    error('One of command was crushed', err.message);
  } finally {
    log(`Execute ${removeCommand}`);
    exec(removeCommand);
  }
};
