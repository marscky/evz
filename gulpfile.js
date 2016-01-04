'use strict';

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

gulp.task('build:osx', ['js', 'sass'], function () {
  var opts = {
    dir: '.',
    ignore: /EVZ-|gulpfile\.js|app\/(app\..*\.js|sass|((eval|login)\/.*\.js)|sass|assets\/settings\.json)/,
    name: 'EVZ',
    'build-version': '0.1.0',
    icon: './app/assets/icons/icon',
    platform: 'darwin',
    arch: 'x64',
    version: '0.36.1'
  };

  packager(opts, function done (err, appPath) {
    if (err) {
      console.log('build:osx error', err);
    } else {
      console.log('build:osx created at', appPath);
    }
  });
});

gulp.task('default', ['js', 'js:watch', 'sass', 'sass:watch']);
