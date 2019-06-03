/**
 * gulp-cmd-jst html->js
 */
exports.init = function(grunt) {
    const through = require('through2');
    const gutil = require('gulp-util');

    var exports = {};

    var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        quote = function (string) {
            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.
            rx_escapable.lastIndex = 0;
            if (rx_escapable.test(string)) {
                return '"' + string.replace(rx_escapable, function (a) {
                        var c = meta[a];
                        if (typeof c === 'string') {
                            return c;
                        }
                        else {
                            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }
                    }) + '"';
            }
            else {
                return '"' + string + '"';
            }
        };

	function transport () {
		const stream = through.obj((file, enc))
	}
    exports.transport = function(){
    	var stream = through.obj(function(file, enc, cb) {
    		var content = file.contents.toString();
    		content = [
    		        'define(function(require, exports, module){',
    		        '    module.exports=' + quote(content).replace(/\s+/g, ' ') + ';',
    		        '});'
    		        ].join('\n');
    		file.contents = new Buffer(content);
            file.path = gutil.replaceExtension(file.path, ".js");
            this.push(file);
            return cb();
    	});
    	return stream;
    };

    exports.dealCss = function(options) {
        var options = options || null;
        var stream = through.obj(function(file, enc, cb) {
            if (file.isNull()) {
              this.push(file);
              return cb();
            }
            if (file.isBuffer()) {
                try {
                    if (options) {
                        var fileContent = file.contents.toString();
                        options.forEach(function ( item ){
                            var imgarrs = item.split('imgToMd5s');
                            var palt = new RegExp(imgarrs[0].toString() , 'g');
                            var replacement = imgarrs[1].toString();
                            file.contents = new Buffer(String(file.contents).replace( palt , replacement));
                        });
                    }
                } catch(err) {
                    this.emit('error', 'img md5 error');
                }

                this.push(file);
                return cb();
            }

            if (file.isStream()) {
                this.emit('error', 'img md5 stream error');
                return cb();
            }
        });

        return stream;
    };

    return {
		transport,
		dealCss,
	};
};
