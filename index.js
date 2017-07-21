const map = require('codemap');

module.exports = function () {
  const rootMap = {
    _maps: [require('./_codemap')],

    'get': function container(get, set) {
      return get;
    },
    'set': function container(get, set) {
      return set;
    },
    'use': function container(get, set) {
      return function use() {
        [].slice.call(arguments).forEach(function (arg) {
          instance.parseMap(arg);
        });
        instance.validatePathCache();
      };
    }
  };

  const instance = map(rootMap);
  return instance.export();
};

module.exports.version = require('./package.json').version;
