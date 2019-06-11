/**
 * 应该管理路由注册规则入口
 */
define(function (require, exports, modules) {
	// 引入 vue
	require('base-vue');
	const util = require("{{isApp 'app-' : ''}}{{name}}-modules/core/util");
	var inited = false;

    // Vue 组件多语言处理
	if (!Vue.prototype.$t) {
		Vue.prototype.$t = $t;
	}

	const tplRouterReg = (path) => {
		util.appRouterReg(path, "{{isApp 'app-' : ''}}{{name}}", {
			// CSS依赖项
			cssDeps: [
				'{{isApp "app-" : ""}}{{name}}-assets/style/all.css',
			],
		});
	};

	[
		'#{{isApp ? "app/" : ""}}{{name}}/test',
	].forEach((router) => {
		tplRouterReg(router);
	})

	exports.init = function () {
		if (inited) return;
		// 这里执行 todo
		inited = true;
	}
});
