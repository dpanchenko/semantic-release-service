require('babel-register');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const processor = require('./libs/processor');
const { log, error } = require('./libs/debug')('service');

require('./libs/expressAsyncErrors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/hook/:branch', async (req, res) => {
  log(`processHookRequest called from repo ${req.body.repository.full_name}`);
  const payload = {
    watch: req.params.branch || process.env.GIT_REPO_WATCH_BRANCH,
    data: req.body,
  };
  log('publish to semantic package');
  try {
    await processor(payload);
    return res.json({ status: 'ok' });
  } catch (err) {
    log(`error occured: ${JSON.stringify(err)}`);
    return res.status(500).json({ status: 'fail', error: err });
  }
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  error(`server error: ${JSON.stringify(err)}`);
  res.status(500).json({ status: 'fail', error: err });
});

app.listen(process.env.PORT, () => {
  log(`waiting connections on http://0.0.0.0:${process.env.PORT}`);
});

