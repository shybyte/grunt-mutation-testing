var path = require('path');
var _ = require('lodash');

exports.init = function (grunt, opts) {
  if (!opts.karma) {
    return;
  }

  var runner = require('karma').runner;
  var backgroundProcess;
  var karmaConfig = _.extend({
      // defaults, but can be overwritten
      reporters: [],
      logLevel: 'OFF',
      waitForServerTime: 5
    },
    opts.karma, {
      // can't be overwritten, because important for us
      configFile: path.resolve(opts.karma.configFile),
      background: false,
      singleRun: false,
      autoWatch: false
    }
  );

  opts.before = function (doneBefore) {
    backgroundProcess = grunt.util.spawn({
      cmd: 'node',
      args: [path.join(__dirname, '..', 'lib', 'run-karma-in-background.js'), JSON.stringify(karmaConfig)]
    }, function () {
    });

    process.on('exit', function () {
      backgroundProcess.kill();
    });

    setTimeout(function () {
      doneBefore();
    }, karmaConfig.waitForServerTime * 1000);

  };

  opts.test = function (done) {
    runner.run(karmaConfig, function(numberOfCFailingTests) {
      done(numberOfCFailingTests === 0);
    });
  };

  opts.after = function () {
    backgroundProcess.kill();
  };

};
