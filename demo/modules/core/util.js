/**
 * @description 通用基础方法
 */
define(function(require, exports, modules) {
	const util = require('base-modules/utils');

	const cUtil = _.extend({}, util, {
		tplRouterReg() {

		},
	});

	modules.exports = cUtil;
});
