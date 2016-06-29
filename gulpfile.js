  var 
      gulp = require('gulp'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat'),
      autoprefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      watch = require('gulp-watch'),
      notify = require('gulp-notify'),
      remember = require('gulp-remember'),
      haml = require('gulp-haml');
      path = require('path'),
      del = require('del'),
      browserSync = require('browser-sync').create();
    
    gulp.task('haml', function() {
        return gulp.src('develop/temp/*.haml')
              .pipe(haml().on('error', notify.onError({
                title: "HAML"
              })))
              .pipe(gulp.dest('public'));
    });

    gulp.task('sass', function() {
        return gulp.src(['develop/styles/normalize.scss', 'develop/styles/style.scss'], { since: gulp.lastRun('sass') })
              .pipe(sourcemaps.init())
              .pipe(remember('sass'))
              .pipe(concat('style.scss'))
              .pipe(sass().on('error', notify.onError({
                title: "SASS"
              })))
              .pipe(autoprefixer({
                browsers: ['Last 10 versions', 'Firefox <= 20', 'IE <= 10'],
                cascade: false
              }))
              .pipe(sourcemaps.write())
              .pipe(gulp.dest('public/css'));
    });

    gulp.task('concatJS', function() {
      return gulp.src(['./develop/js/jquery.js', 'develop/js/masonry.js', 'develop/js/handlebars.js', 'develop/js/imageLoad.js', 'develop/js/offers.js', 'develop/js/user.js', 'develop/js/controller.js'])
            .pipe(sourcemaps.init())
            .pipe(remember('concatJS'))
            .pipe(concat('main.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./public/js/'));
    });

    gulp.task('build', gulp.parallel('haml', 'sass', 'concatJS'));

    gulp.task('watch', function() {
        gulp.watch('develop/styles/**/*.scss', gulp.series('sass')).on('unlink', function(filepath) {
            remember.forget('sass', path.resolve(filepath));
        });

        gulp.watch('develop/temp/*.haml', gulp.series('haml'));
        gulp.watch('develop/js/*.js', gulp.series('concatJS'));
    });

    gulp.task('default', gulp.series('build', gulp.parallel('watch')));
