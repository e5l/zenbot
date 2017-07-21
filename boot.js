const glob = require('glob');

module.exports = function (cb) {
  const zenbot = require('./')();

  const c = require('./conf');
  const defaults = require('./conf-sample');

  Object.keys(defaults).forEach(function (k) {
    if (typeof c[k] === 'undefined') {
      c[k] = defaults[k];
    }
  });

  zenbot.set('@zenbot:conf', c);

  function withMongo() {
    //searches all directories in {working_dir}/extensions/ for files called '_codemap.js'
    glob('extensions/**/_codemap.js', {cwd: __dirname, absolute: true}, function (err, results) {

      if (err) {
        return cb(err);
      }

      results.forEach(function (result) {
        //load the _codemap for the extension
        const ext = require(result);
        //load the extension into zenbot
        zenbot.use(ext);
      });
      cb(null, zenbot);
    });
  }

  const u = 'mongodb://' + c.mongo.host + ':' + c.mongo.port + '/' +
            c.mongo.db + (c.mongo.replicaSet ? '?replicaSet=' + c.mongo.replicaSet : '');

  require('mongodb').MongoClient.connect(u, function (err, db) {
    if (err) {
      zenbot.set('zenbot:db.mongo', null);
      console.error('warning: mongodb not accessible. some features (such as backfilling/simulation) may be disabled.');
      return withMongo();
    }
    zenbot.set('zenbot:db.mongo', db);
    if (c.mongo.username) {
      db.authenticate(c.mongo.username, c.mongo.password, function (err, result) {
        if (err) {
          zenbot.set('zenbot:db.mongo', null);
          console.error('warning: mongodb auth failed. some features (such as backfilling/simulation) may be disabled.');
        }
        withMongo();
      });
    }
    else {
      withMongo();
    }
  });
};
