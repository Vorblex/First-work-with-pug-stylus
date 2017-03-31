var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    pug = require('gulp-pug'),
    gulpIf = require('gulp-if'),
    wiredep = require('gulp-wiredep'),
    useref = require('gulp-useref'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    cleanCSS = require('gulp-clean-css');


gulp.task('stylus', function() {
    return gulp.src(['app/static/styl/*.styl', '!app/static/styl/_*.styl'])
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Styles',
                    message: err.message
                }
            })
        }))
        .pipe(stylus({
            'include css': true
        }))
        .pipe(autoprefixer(['last 15 versions', '>1%', 'ie 8', 'ie 7'], {
            cascade: true
        }))
        .pipe(rename({
            suffix: ''
        }))
        .pipe(gulp.dest('app/static/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        }
    });
});


gulp.task('pug', function() {
    gulp.src('app/pug/pages/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError(function(err) {
                return {
                    title: 'Styles',
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(wiredep({
            directory: 'app/libs/'
        }))
        .pipe(gulp.dest('./app'));
});

gulp.task('watch', ['browser-sync', 'stylus'], function() {
    gulp.watch('app/static/styl/**/*.styl', ['stylus']);
    gulp.watch(['app/pug/**/*.pug', 'bower.json'], ['pug']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/static/js/*.js', browserSync.reload);
});

gulp.task('clean', function() {
    return del.sync('build');
});

gulp.task('img', function() {
    return gulp.src('app/static/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            une: [pngquant()]
        })))
        .pipe(gulp.dest('build/static/img'));
});

gulp.task('build', ['clean', 'libs', 'img', 'stylus'], function() {
    var buildCss = gulp.src([
            'app/static/css/*.css'
        ])
        .pipe(gulp.dest('build/static/css'));
    var buildFonts = gulp.src('app/static/fonts/**/*')
        .pipe(gulp.dest('build/static/fonts'));

    var buildJs = gulp.src('app/static/js/**/*.js')
        .pipe(gulp.dest('build/static/js'));

    var buildHtml = gulp.src('app/*html')
        .pipe(wiredep({
            directory: 'build/libs'
        }))
        .pipe(useref())
        .pipe(gulp.dest('build'))
        .on('end', function() {
            gulp.run('min');
        });
});

gulp.task('useref', function() {
    return gulp.src('build/*.html')
        .pipe(useref())
        .pipe(gulp.dest('build/'));
});

gulp.task('min', function() {
    return gulp.src(['build/static/**/vendor.min.js', 'build/static/**/*.css'])
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cleanCSS()))
        .pipe(gulp.dest('build/static/'));
});

gulp.task('libs',  function() {
    return gulp.src('app/libs/**/*.*')
        .pipe(gulp.dest('build/libs'));
});

gulp.task('clear', function() {
    return cache.clearAll();
});

gulp.task('default', ['watch']);

