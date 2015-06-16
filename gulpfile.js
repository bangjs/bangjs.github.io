var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var gulpData = require('gulp-data');

var through2 = require('through2');

var minimist = require('minimist');
var options = minimist(process.argv.slice(2), {
	string: 'src'
});

var hljs = require('highlight.js');
var marked = require('marked');
marked.setOptions({
	highlight: function (code) {
		return hljs.highlightAuto(code).value;
	}
});

var nunjucks = require('nunjucks');
nunjucks.configure({
	watch: false
});


gulp.task('index', function () {

	return gulp.src('templates/index.html').
		pipe(through2.obj(function (file, enc, cb) {

			file.contents = new Buffer(nunjucks.renderString(file.contents.toString()));
			
			this.push(file);
			cb();

		})).
		pipe(
			gulp.dest('.')
		);

});

gulp.task('articles', function () {

	if (!options.src) return;

	return gulp.src(options.src).
		pipe(gulpData(function (file) {
			return {
				body: marked(file.contents.toString())
			};
		})).
		pipe(through2.obj(function (file, enc, cb) {

			file.contents = new Buffer(nunjucks.render('templates/article.html', file.data));
			file.path = gulpUtil.replaceExtension(file.path, '.html');

			this.push(file);
			cb();

		})).
		pipe(
			gulp.dest('articles')
		);

});

gulp.task('default', ['index', 'articles']);