var gcoffee = require('gulp-coffee');
var gutil = require('gulp-util');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var production = false;

gulp.task('default', ['sass', 'coffee']);

gulp.task('coffee', function() {
    gulp.src('./main/static/main/coffee/*.coffee')
        .pipe(gulpif(!production, sourcemaps.init()))
        .pipe(gcoffee({bare:true}).on('error', gutil.log))
        .pipe(gulpif(!production, sourcemaps.write('./maps')))
        .pipe(gulp.dest('./main/static/main/build/js/'))
});

var sass_task = function(sass_src, sass_dest) {
    return function () {
        return gulp.src(sass_src)
            .pipe(gulpif(!production, sourcemaps.init()))
            .pipe(sass({ outputStyle: production ? 'compressed' : 'nested' }))
            .pipe(sass().on('error', sass.logError))
            .pipe(gulpif(!production, sourcemaps.write('./maps')))
            .pipe(gulp.dest(sass_dest))
    }
};

gulp.task('sass', sass_task('./main/static/main/scss/*.scss', './main/static/main/build/css/'));
