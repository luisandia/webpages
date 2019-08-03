import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import cleanCSS from 'gulp-clean-css';
import del from 'del';
import browserSync from 'browser-sync';
import cssnano from 'cssnano';
import postcss from 'gulp-postcss';
import pug from 'gulp-pug';

const server = browserSync.create();

const postCSSPlugins = [
    cssnano({
        core: false,
        autoprefixer: {
            add: true
        }
    })
];


const paths = {
    styles: {
        src: './dev/scss/styles.scss',
        dest: './public/css',
        watch: './dev/scss/**/*.scss'
    },
    scripts: {
        src: './dev/js/*.js',
        dest: './public/js',
        watch: './dev/js/*.js'

    },
    pugs: {
        src: './dev/pug/pages/*.pug',
        dest: './public',
        watch: './dev/pug/**/*.pug'

    }
};

/*
 * For small tasks you can export arrow functions
 */
export const clean = () => del(['assets']);

/*
 * You can also declare named functions and export them as tasks
 */
export function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(postcss(postCSSPlugins))
        // pass in options to the stream
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(server.stream({ match: '**/*.css' }));
}

export function scripts() {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest));
}

export function pugtasks() {
    return gulp.src(paths.pugs.src)
        .pipe(pug())
        .pipe(gulp.dest(paths.pugs.dest));
}

/*
 * You could even use `export as` to rename exported tasks
 */
function watchFiles() {
    server.init({
        server: {
            baseDir: paths.pugs.dest
        }
    })
    gulp.watch(paths.scripts.watch, scripts).on("change",server.reload);
    gulp.watch(paths.styles.watch, styles);
    gulp.watch(paths.pugs.watch, pugtasks).on("change",server.reload);
}
export { watchFiles as watch };

const build = gulp.series(clean, gulp.parallel(styles, scripts, pugtasks));
/*
 * Export a default task
 */
export default build;