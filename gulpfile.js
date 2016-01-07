'use strict';

var _ = require('lodash');
var del = require('del');
var gulp = require('gulp');
var packager = require('electron-packager');
var $ = require('gulp-load-plugins')();

gulp.task('clean', function () {
  return del(['app/build/script.js']);
});

gulp.task('js', ['clean'], function () {
  return gulp.src(['!app/node/**/*.js', 'app/**/*.module.js', 'app/**/*.js'])
    .pipe($.concat('script.js'))
    .pipe(gulp.dest('app/build'));
});

gulp.task('js:watch', function () {
  gulp.watch('app/**/*.js', ['js']);
});

gulp.task('sass', function () {
  return gulp.src('app/sass/style.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(gulp.dest('app/build'));
});

gulp.task('sass:watch', function () {
  gulp.watch('app/sass/**/*.scss', ['sass']);
});

function getBuildOpts (test) {
  var opts = {
    dir: '.',
    ignore: /EVZ-|gulpfile\.js|app\/(app\..*\.js|sass|((eval|login)\/.*\.js)|sass|assets\/settings\.json)/,
    name: 'EVZ',
    'build-version': '0.1.3',
    icon: './app/assets/icons/icon',
    platform: ['darwin', 'win32'],
    arch: ['ia32', 'x64'],
    version: '0.36.1'
  };

  if (test) {
    return _.defaults({ platform: 'darwin', arch: 'x64', overwrite: true }, opts);
  } else {
    return opts;
  }
}

gulp.task('build:test', ['js', 'sass'], function () {
  var opts = getBuildOpts(true);

  packager(opts, function done (err, appPath) {
    if (err) {
      console.log('build error', err);
    } else {
      console.log('build created at', appPath);
    }
  });
});

gulp.task('build', ['js', 'sass'], function () {
  var opts = getBuildOpts();

  packager(opts, function done (err, appPath) {
    if (err) {
      console.log('build error', err);
    } else {
      console.log('build created at', appPath);
    }
  });
});

gulp.task('default', ['js', 'js:watch', 'sass', 'sass:watch']);
