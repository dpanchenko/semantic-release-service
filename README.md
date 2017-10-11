# semantic-release


## Configuration
``` bash
export DEBUG=semantic*
export MQTT_URL=tcp://iot.eclipse.org:1883
export MQTT_CHANNEL=github:webhook:test
export CLUBHOUSE_TOKEN=token_here
export GIT_PROTOCOL=https://
export GIT_USER=username_here
export GIT_TOKEN=token_here
export GIT_REPO_FULL_NAME=dpanchenko/autotagging
export GIT_REPO_WATCH_BRANCH=master
export SEMANTIC_STRATEGY=clubhouse
```

## Dockerization

``` bash
docker build -t getprodigy/semantic .
```

``` bash
docker run -d --name semantic
  -e DEBUG="semantic*"
  -e MQTT_URL=tcp://iot.eclipse.org:1883
  -e MQTT_CHANNEL=github:webhook:test
  -e CLUBHOUSE_TOKEN=token_here
  -e GIT_PROTOCOL=https://
  -e GIT_USER=username_here
  -e GIT_TOKEN=token_here
  -e SEMANTIC_STRATEGY=clubhouse getprodigy/semantic
```

## Use as package

``` bash
npm i semantic-release
```

``` javascript
const semantic = require('semantic-release');
const payload = JSON.stringify({
  data: 'pull request data',
  watch: 'defaultWatchBranch',
});
semantic(payload).then(() => {
  log('done');
}).catch(() => {
  console.log('error')
});
```

# outdated information. will update soon

Because we don't have any information about branch-name that was merged before, so the main idea to use specific `markers` in commit messages for analyze how we should bump our version.

This script get commits history from specific repo default branch, interate all commits until last version bumping, analyze each commit message and make desicion what we should do: patch, minor or major.

It allow to create specific strategies to analyze commit messages. There is two strategies now:
- default
- clubhouse

Default strategy analyze messages for markers `BUG`, `FEATURE`, `MAJOR`
For example
``` bash
BUG fix sample bug 1
BUG fix sample bug 2
BUG fix sample bug 3
0.0.2
```
will advice to do `npm version patch`, because we have only bug fixes

``` bash
FEATURE done sample feature
BUG fix sample bug 4
0.0.3
BUG fix sample bug 1
BUG fix sample bug 2
BUG fix sample bug 3
0.0.2
```
will advice to do `npm version minor`, because from last version bumping we have bug fixes and new feature

Clubhouse strategy analyze messages for markers `chXXXX` where XXXX id clubhouse story ID. After that script ask story type from clubhouse and analyze it.
For example
```
ch4895: sample bug ticket for semantic release automation
0.0.2
```
will advice to do `npm version patch`, because we have bug type for story 4895

``` bash
ch4991: sample feature ticket for semantic release automation
0.0.3
ch4895: sample bug ticket for semantic release automation
0.0.2
```
will advice to do `npm version minor`, because from feature type for story 4991. the same for chore.

we need to set env var for running
```
export DEBUG=semantic*
export CLUBHOUSE_TOKEN=<clubhouse token>
export GIT_TOKEN=<clubhouse token>
export GIT_REPO_OWNER=dpanchenko
export GIT_REPO_NAME=autotagging
export SEMANTIC_STRATEGY=clubhouse | default
```

Will modify this script to harbormaster plugin soon
