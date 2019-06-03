/**
 * 应该管理路由注册规则入口
 */
define(function(require, exports, modules) {
    var util = require("base-modules/utils");
    require('base-vue'); // 引入 vue
    var inited = false;
    var tplRouterReg = function(path) {
        util.appRouterReg(path, "app-manage", {
            cssDeps: ['app-common-assets/style/common.css', 'app-manage-assets/style/all.css']
        });
    };

    //应用配置
    tplRouterReg("#app/manage/appconfig/=/:param-:value");
    //应用操作日志
    tplRouterReg("#app/manage/appactionlogs/=/:param-:value");

    //新版应用管理中心
    tplRouterReg("#app/manage/appmanage");
    tplRouterReg("#app/manage/appmanage/=/:param-:value");

    //应用广场
    tplRouterReg("#app/manage/appstore");

    // 应用中心2.0 应用详情
    tplRouterReg("#app/manage/appdetailnew/=/:param-:value");

    // 应用中心2.0 应用详情 添加说明
    tplRouterReg("#app/manage/plusdesc");
    tplRouterReg("#app/manage/plusdesc/=/:param-:value");

    //我的应用-应用管理员权限
    tplRouterReg("#app/manage/myapps");
    tplRouterReg("#app/manage/myapps/=/:id-:value");

    //企业互联应用
    tplRouterReg("#app/manage/eiapp");
    tplRouterReg("#app/manage/eiauth/=/:param-:value");
    //tplRouterReg("#app/manage/eiapp/=/:id-:value");

    //客户互联应用
    tplRouterReg("#app/manage/ciapp");

    exports.init = function() {
        if (inited) return;
        //这里执行
        inited = true;
    }
});