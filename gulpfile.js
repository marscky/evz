'use strict';

var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');

gulp.task('css', function () {
  return gulp.src('./style.css')
    .pipe(postcss([
      autoprefixer({ browsers: ['last 2 versions'] })
    ]))
    .pipe(gulp.dest('./assets'));
});

gulp.task('css-watch', function () {
  gulp.watch('./style.css', ['css']);
});


gulp.task('default', ['css', 'css-watch']);
