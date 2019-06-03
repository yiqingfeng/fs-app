var fs = require('fs'),
    gulp = require("gulp"),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

var script = require('./gulp-tasks/script').init(gulp),
    transport = script.transport;

var moduleName = 'app-formpro',
    srcPath = "formpro/",
    distPath = "formpro-dist/",
    tplConfig = "tpl_config";

/*
 * @desc 清理dist目录文件
 */
gulp.task("clean", function() {
    return gulp.src(distPath, {
            read: false
        })
        .pipe(plugins.rimraf());
});

/*
* @desc 检查全部js文件
*/
gulp.task('checkJs',function(){
    return gulp.src([srcPath + '**/*.js', '!' + srcPath + '**/*-html.js', '!' + srcPath + '**/select.js'])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter(function (result, data, opt){
            if( result ){
                console.log( result );
            }
            return result;
        }))
        .pipe(plugins.jshint.reporter('fail'));
});

/**
 * babel转译ES6
 */
gulp.task('babel',function(){
    return gulp.src([srcPath + '**/*.js', '!' + srcPath + '**/*-html.js'])
        .pipe(plugins.plumber({
            errorHandler(err) { notifyError.call(this, err, 'babel', 'js babel') }
        }))
        //.pipe($.if(needSourceMaps, $.sourcemaps.init()))
        .pipe(plugins.babel({ compact: false }))
        //.pipe($.if(needSourceMaps, $.sourcemaps.write('.')))
        .pipe(gulp.dest(distPath))
});

/*
 * @desc 复制文件到dist目录
 */
gulp.task("copy", function() {
    return gulp.src([
            srcPath + '**/*.*',
            '!' + srcPath + "**/*.{less,sass,html,md}"
        ])
        .pipe(gulp.dest(distPath))
});

/*
 * @desc js文件经babel拷贝到distPath, copy任务中排除 js, 此处需要将 *-html.js 的拷贝过去
 */
gulp.task("copyHtmlJs", function() {
    return gulp.src([
            srcPath + '**/*-html.js',
        ])
        .pipe(gulp.dest(distPath));
});

/*
 * @desc html转js文件
 */
// gulp.task('jst_modules', function() {
//     var onError = function(err) {
//         plugins.notify.onError({
//             title: "Gulp",
//             subtitle: "Failure!",
//             message: "html error: <%= error.message %>",
//             sound: "Beep"
//         })(err);
//         this.emit('end');
//     };
//     return gulp.src(srcPath + '/modules/**/*.html')
// 	    .pipe(plugins.plumber({
// 	        errorHandler: onError
// 	    }))
// 	    .pipe(plugins.cmdJst({
// 	        templateSettings: {
// 	            evaluate: /##([\s\S]+?)##/g,
// 	            interpolate: /\{\{(.+?)\}\}/g,
// 	            escape: /\{\{\{\{-([\s\S]+?)\}\}\}\}/g
// 	        },
// 	        processName: function(filename) {
// 	            var moudle = filename.slice(0, filename.indexOf('/'))
// 	            return moudle + '-' + filename.slice(filename.lastIndexOf('/') + 1, filename.lastIndexOf('.'));
// 	        },
// 	        processContent: function(src) {
// 	            return src.replace(/(^\s+|\s+$)/gm, '');
// 	        },
// 	        prettify: true,
// 	        cmd: true
// 	    }))
// 	    .pipe(plugins.rename({
// 	        suffix: '-html'
// 	    }))
// 	    .pipe(gulp.dest(srcPath + '/modules/'))
// });

/*
 * @desc html转js文件
 */
// gulp.task('jst_tpls', function() {
//     var onError = function(err) {
//         plugins.notify.onError({
//             title: "Gulp",
//             subtitle: "Failure!",
//             message: "html error: <%= error.message %>",
//             sound: "Beep"
//         })(err);
//         this.emit('end');
//     };
//     return gulp.src(srcPath + '/tpls/**/*.html')
//         .pipe(plugins.plumber({
//             errorHandler: onError
//         }))
//         .pipe(transport())
//         .pipe(plugins.rename({
//             suffix: '.html'
//         }))
//         .pipe(gulp.dest(distPath + '/tpls/'))
// });

/*
* @desc html转js文件
*/
gulp.task('jst', function() {
    var onError = function(err) {
        plugins.notify.onError({
            title: "Gulp",
            subtitle: "Failure!",
            message: "html error: <%= error.message %>",
            sound: "Beep"
        })(err);
        this.emit('end');
    };
    return gulp.src(srcPath + '**/*.html')
        .pipe(plugins.plumber({
            errorHandler: onError
        }))
        .pipe(transport())
        .pipe(plugins.rename({
            suffix: '.html'
        }))
        .pipe(gulp.dest(distPath))
});

/*
 * @desc Transport JS
 */
gulp.task("cmd", function() {
    return gulp.src([ distPath + '**/*.js','!' + distPath + 'data/*.js'])
        .pipe(plugins.plumber())
        .pipe(plugins.cmdTransit({
            dealIdCallback: function(id) {
                if( /\//.test( id ) ){
                    return moduleName + '-' + id;
                }else{
                    return moduleName + '/' + id;
                }
            }
        }))
        .pipe(gulp.dest(distPath))
        .pipe(plugins.uglify({
            mangle: true,
            compress: {
                drop_console: true
            }
        }))
        .pipe(gulp.dest( distPath ))
});

/*
 * @desc 图片进行压缩
 */
var pngquant = require('imagemin-pngquant');
gulp.task('min-image', function() {
    return gulp.src(distPath + '**/*.{png,jpg,gif}')
        .pipe(plugins.imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(distPath));
});

/**
 * @desc concat js all.css
 */
gulp.task('concat_css_all', function() {
	return gulp.src([distPath + '/assets/style/all.css'])
        .pipe(plugins.minifyCss())
        .pipe(plugins.concat('/assets/style/all.css'))
		.pipe(gulp.dest(distPath));
});

/*
 * @desc 合并js文件
 */
var buildFileTask = [],
	concatJSTask = [],
    allConcatFiles = [];
gulp.task('concat_js', function() {
    var json = require('./concat.json'),
    	srcFiles;
    if (!json) return;
    for (var o in json) {
    	srcFiles = json[o] || [];
    	for(var i=0,len=srcFiles.length; i<len; i++){
    		if(srcFiles[i].indexOf('!')==0) {
    			srcFiles[i] = '!' + distPath + srcFiles[i].substring(1);
    		} else {
    			srcFiles[i] = distPath + srcFiles[i];
    		}
    	}
        allConcatFiles = allConcatFiles.concat(json[o]);
        buildFileTask.push({
        	targetFile: o,
        	srcFiles: json[o]
        });
        concatJSTask.push(o);
    }
    buildFileTask.forEach(function(item) {
        gulp.task(item['targetFile'], function() {
        	var idx = item['targetFile'].lastIndexOf('/'),
        		path = item['targetFile'].substring(0, idx);
            return gulp.src(item['srcFiles'])
	            .pipe(plugins.plumber())
	            .pipe(plugins.uglify({
	                mangle: true,
	                compress: {
	                    drop_console: true
	                }
	            }))
	            .pipe(plugins.concat(item['targetFile']))
	            .pipe(gulp.dest('temp/'))
        });
    });
});

/*
 * @desc 清除合并之前的旧文件
 */
gulp.task('del-old-js', function() {
    return gulp.src(allConcatFiles).pipe(plugins.clean());
});

/*
 * @desc 把合并后的js文件从临时文件夹拷贝到目的文件夹
 */
gulp.task('copy-concat-js', function() {
    return gulp.src('temp/**').pipe(gulp.dest(distPath));
});

/*
 * @desc less html变化 刷新浏览器 livereload
 */
gulp.task('look', function() {
    plugins.livereload.listen();
    gulp.watch([srcPath + '**/*.less'], ['less-min']);
    gulp.watch([srcPath + '**/*.js', '!' + srcPath + '**/*-html.js']).on('change',function(e){
      jsHintrc(e);
    });
    // gulp.watch([srcPath + '/modules/**/*.html'], ['jst_modules']);
});

/*
 * @desc less文件监听、编译
 */
var lessDir = srcPath + 'assets/style/';
gulp.task('less-min', function() {
    var onError = function(err) {
        plugins.notify.onError({
            title: "Gulp",
            subtitle: "Failure!",
            message: "less error: <%= error.message %>",
            sound: "Beep"
        })(err);
        this.emit('end');
    };
    return gulp.src([lessDir + 'all.less'])
        .pipe(plugins.plumber({
            errorHandler: onError
        }))
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({
            browsers: ['last 20 versions'],
            cascade: true
        }))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest(lessDir))
        .pipe(plugins.notify({
            title: 'Gulp',
            subtitle: 'success',
            message: 'less OK',
            sound: "Pop"
        }))
        .pipe(plugins.livereload());
});

/*
 * @desc js校验
 */
function jsHintrc(e){
    var onError = function(err) {
        plugins.notify.onError({
            title:    "Gulp",
            subtitle: "Failure!",
            message:  "js代码不规范,看控制台先!!!",
            sound:    "Beep"
        })(err);
        this.emit('end');
    };
    gulp.src( e.path,{ base: srcPath } )
        .pipe(plugins.plumber({errorHandler: onError}))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter(function (result, data, opt){
            if( result ){
                console.log( result );
            }
            return result;
        }))
        .pipe(plugins.jshint.reporter('fail'))
        .pipe(plugins.notify({
            title: 'Gulp',
            subtitle: 'success',
            message: 'js OK now',
            sound: "Pop"
        }))
}

/*
 * @desc 对图片进行md5
 * 生成rev-imgmanifest.json
 */
gulp.task('md5-img', function() {
    return gulp.src([distPath + '**/*.{png,jpg,gif}'])
        .pipe(plugins.clean())
        .pipe(plugins.rev())
        .pipe(gulp.dest(distPath))
        .pipe(plugins.rev.manifest('rev-imgmanifest.json'))
        .pipe(gulp.dest(distPath))
});

/*
 * @desc 将css中的图片替换成md5后的
 */
var merge = require('merge-stream');
gulp.task("md5-dealCssImg",function (){
    var json = require('./' + distPath + 'rev-imgmanifest.json');
    if (!json) return;
    var imgArr = [];
    for (var o in json) {
        if( /assets\/images/.test( o ) ){
            imgArr.push(
               o.match(/images\/.*/).toString()+ "imgToMd5s" +json[o].match(/images\/.*/).toString()
            );
        }
    }
    var cssStream = gulp.src(['./' + distPath + 'assets/style/*.css'])
        .pipe(plugins.minifyCss())
        .pipe(script.dealCss(imgArr))
        .pipe(gulp.dest('./' + distPath + 'assets/style/'));
    var jsStream = gulp.src([distPath + '**/*.js'])
        .pipe(script.dealCss(imgArr))
        .pipe(gulp.dest(distPath));

    return merge(cssStream, jsStream);
});

/*
 * @desc css js 文件做md5
 */
gulp.task('md5-css-js', function() {
    return gulp.src([distPath + '**/*.js', distPath + '**/*.css', '!' + distPath + 'app.js'])
        .pipe(plugins.rev())
        .pipe(gulp.dest(distPath))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(distPath))
});

/*
 * 转为seajs.config的格式
 */
function transportJson() {
    var json = require('./' + distPath + 'rev-manifest.json');
    if (!json) return;
    var backJson = '[';
    for (var o in json) {
    	if(o != 'app.js') {
    		backJson += '["app-dist/' + distPath + o + '","app-dist/' + distPath + json[o] + '"],';
    	}
    }
    backJson = backJson.substr(0, backJson.length - 1) + ']';
    return 'seajs.config({map:' + backJson + '});'
}

/*
 * @desc 生成seajs config map 并合到app.js文件中
 */
gulp.task('jsmap', function() {
	var json = require('./' + distPath + 'rev-manifest.json');
    if (!json) return;
    var strs = transportJson();
    var fs = require("fs");
    //读取app.js
    var data = fs.readFileSync('./' + distPath + 'app.js', 'utf8');
    //向app.js中写入map（也就是seajs.config）
  	fs.writeFileSync('./' + distPath + 'app.js', strs + '\n' + data);
    //md5 app.js文件
    return gulp.src([distPath + 'app.js'])
      .pipe(plugins.rev())
      .pipe(gulp.dest(distPath))
      .pipe(plugins.rev.manifest('rev-jsappmanifest.json'))
      .pipe(gulp.dest(distPath))
});

/**
 * @desc 生成app.js的配置文件，用于模板页
 */
gulp.task('config-tpl', function(){
	var appjson = require('./' + distPath + 'rev-jsappmanifest.json'),
  		js_app;
	if(!appjson) {
		console.error('error: file rev-jsappmanifest.json not found or content blank');
		this.emit('end');
	}
	js_app = appjson["app.js"];
	if(!js_app) {
		console.log("not found tpl configs: js_app");
		this.emit('end');
	}
	var content = 'app_formpro_js_app:' + js_app + '\n';
	fs.writeFileSync('./' + distPath + tplConfig, content);
});

/*
 * @desc del文件
 */
var del = require('del');
gulp.task('del-files', function() {
    //del([distPath + '*.json', 'temp']);
    gulp.src([distPath + '*.json', 'temp'])
        .pipe(plugins.clean());
    walk(distPath);
});
// 删除空文件夹
function walk(path){
    var dirList = fs.readdirSync(path);
    if (dirList.length === 0) {
        fs.rmdirSync(path);
    }
    dirList.forEach(function(item){
        if (fs.statSync(path + '/' + item).isDirectory()) {
            walk(path + '/' + item);
        }
    });
}

/*
 * @desc 默认监听less文件和html转为jst函数
 */
gulp.task("default", ['less-min', 'look']);

/*
 * @desc 代码构建
 */
gulp.task("build", function(cb) {
    plugins.sequence('clean', 'checkJs', 'jst', 'copy', 'babel', ['cmd'], 'min-image', 'concat_css_all', 'concat_js', concatJSTask, 'del-old-js', 'copy-concat-js', 'del-files', cb);
});
/*
 * @desc 支持增量发布的构建
 */
gulp.task("build-md5", function(cb) {
    plugins.sequence('clean', 'checkJs', 'jst', 'copy', 'babel', ['cmd'], 'min-image', 'concat_css_all', 'concat_js', concatJSTask, 'del-old-js', 'copy-concat-js', 'md5-img', 'md5-dealCssImg', 'md5-css-js', 'jsmap', 'config-tpl', 'del-files', cb);
});
