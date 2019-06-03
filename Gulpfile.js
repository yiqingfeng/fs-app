/**
 * @desc 项目处理
 */
const fs = require('fs');
const gulp = require("gulp");
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins();

const {
	moduleName,
	srcPath,
	distPath,
	tplConfig,
} = require('./config/path');

/**
 * @desc 清理dist目录文件
 */
gulp.task('clean', () => gulp
	.src(distPath, {
		read: false
	})
	.pipe(plugins.rimraf())
);
