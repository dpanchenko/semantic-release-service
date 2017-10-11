const fs = require('fs');
const path = require('path');
const { log } = require('./debug')('loader');

module.exports = (options) => {
  const {
    app = undefined,
    dirname,
    helpstring = 'module',
    excludeFiles = ['index.js'],
  } = options;
  const modules = {};
  const orders = [];

  log(`loading ${helpstring} from directory ${dirname}...`);
  fs.readdirSync(dirname).forEach((fname) => {
    if (excludeFiles.indexOf(fname) !== -1) {
      return;
    }
    const moduleName = fname.replace(/\.js$/, '');
    const modulePath = path.join(dirname, fname);
    try {
      const module = require(modulePath); // eslint-disable-line global-require
      const order = module.order || 1000;
      if (!orders[order]) {
        orders[order] = [];
      }
      orders[order].push(moduleName);
      modules[moduleName] = module;
      log(`load ${helpstring} ${moduleName} ... done`);
    } catch (error) {
      log(`load ${helpstring} ${moduleName} ... error [${error}]`, error.stack, {});
    }
  });

  const modulesResult = [];
  orders.forEach((item) => {
    item.forEach((moduleName) => {
      modules[moduleName].toString = () => moduleName;
      modulesResult.push(modules[moduleName]);
    });
  });

  if (app) {
    log(`init ${helpstring}...`);
    modulesResult.forEach((module) => {
      if (typeof module.use === 'function') {
        try {
          module.use(app);
          log(`init ${helpstring} ${module} ...... done`);
        } catch (error) {
          log(`init ${helpstring} ${module} ...... error [${error}]`, error.stack, {});
        }
      } else {
        log(`${helpstring} ${module} can't be inited on start`);
      }
    });
  }

  return modules;
};
