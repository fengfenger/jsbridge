/*!
 * Name: jsbridge - bridge for IOS&Android
 * Repository: https://github.com/90Team/jsbridge
 * Author: Liweifeng
 */
!(function () {

    //返回浏览器信息
    var UA = navigator.userAgent;
    var Client = function( APP, UA){
        if( this == window ){
            return new Client(APP, UA);
        };
        var match = null,
            reg = makereg(APP, '(<%flg%>)\/([M|C])_(\\d+(?:.\\d+(?:.\\d+)?)?)');

        match = UA.match(reg);
        this.version = (!match ? null : match[3]) || 0;
        this.category = (!match ? null : match[2]) || 0;
        this.name = (!match ? null : match[1]) || 'Browser';

        function makereg(flg, str){
            var regstr = str.replace(/<\%flg\%>/, flg);
            return new RegExp(regstr);
        };
    };
    var client = new Client('Meishizhaoshi', UA);

    //JS Bridge 桥梁构建
    var bridge = {};

    var handler = setNativeBridge;

    bridge.native = window.WebViewJavascriptBridge || null;

    bridge.init = function(){
        console.log(arguments);
        var cb = ([].slice.call(arguments))[0];
        if( bridge.native ){
            if( cb ){cb()};
            return;
        }
        handler(function(native){
            bridge.native = native;
            if( cb ){cb()};
        });
    };

    bridge.on = function(){
        var args = [].slice.call(arguments);
        bridge.native.registerHandler.apply(handler, args);;
    };

    bridge.emit = function(){
        var args = [].slice.call(arguments);
        bridge.native.callHandler.apply(handler, args);
    };

    //暴露接口
    bridge.client = client;
    bridge.isAndroid = UA.indexOf('Android') > -1 || UA.indexOf('Adr') > -1;
    bridge.isiOS = !!UA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    bridge.base = "http://10.0.0.1:8080";

    //初始化
    bridge.init();

    //柯理化
    function currying(fn) {
        var args = [].slice.call(arguments, 1);
        return function() {
            var _args = args.concat([].slice.call(arguments));
            return fn.apply(_args, _args);
        };
    };

    //NativeBridge.js
    function setNativeBridge(callback) {
        if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
        if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
    };

    //M暴露对外接口
    var M = function(){};
    M.prototype = bridge;

    //类型判断
    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]"
        }
    }

    var isObject = isType("Object")
    var isString = isType("String")
    var isArray = Array.isArray || isType("Array")
    var isFunction = isType("Function")
    var isUndefined = isType("Undefined")


    //接口参数统一管理参数 ret Array: [ api, param, callback ]
    function build_args( args, conn ){
        var ret = [];
        if( !conn ){
            console.error("Native api is empty!");
        };
        var defaults = {
            name: conn,
            param: {},
            callback: function(){}
        };
        var args = isArray(args) ? args : [].slice.call(args);
        if( !args[1] && isFunction(args[0]) ){
            defaults.callback = args[0];
        };
        !isObject(args[0]) || ( defaults.param = args[0] );
        !isFunction(args[1]) || ( defaults.callback = args[1] );
        ret.push(defaults.name);
        ret.push(defaults.param);
        ret.push(defaults.callback);
        return ret;
    };

    //生成需要的链接 bulid_link
    function build_link(link){
        var ret = "",
            origin = window.location.origin,
            href = window.location.href;
            // reg_http= /^http[s]?\:\/\//g;

        //是完整的URL
        if( /^http[s]?\:\/\//.test(link) ){
            return link;
        };

        //绝对路径
        if( /^\//.test(link) ){
            return origin+link;
        };
    };

    //分享
    M.prototype.share = function(){
        var args = build_args(arguments, "showShareView" );
        this.emit.apply(bridge, args);
    };

    //打开城市列表
    M.prototype.cityview = function(){
        var args = build_args(arguments, "openCityChooseView" );
        this.emit.apply(bridge, args);
    };

    //获取当前城市
    M.prototype.city = function(){
        var args = build_args(arguments, "getCityNameAndId" );
        this.emit.apply(bridge, args);
    };

    //重新加载webview
    M.prototype.reload = function(){
        var args = build_args(arguments, "refreshWebView" );
        this.emit.apply(bridge, args);
    };

    //获取用户登录的Token
    M.prototype.token = function(){
        var args = build_args(arguments, "getUserToken" );
        this.emit.apply(bridge, args);
    };

    //进度条开启
    M.prototype.inloader = function(){
        var args = build_args(arguments, "showLoading" );
        this.emit.apply(bridge, args);
    };

    //关闭进度条
    M.prototype.unloader = function(){
        var args = build_args(arguments, "hideLoading" );
        this.emit.apply(bridge, args);
    };

    //打开新的浏览器窗口
    M.prototype.link = function(){
        var intro = [].slice.call(arguments),
            link = intro[0] || "",
            outro = [];
        var param = {};
            param.url = build_link(link);
        outro.push(param);
        var args = build_args(outro, "openURL" );
        this.emit.apply(bridge, args);
    };


    // RequireJS && SeaJS
    if (typeof define === 'function') {
        define(function() {
            return new M();
        });

    // NodeJS
    } else if (typeof exports !== 'undefined') {
        module.exports = null;

    // Bowser
    } else {
        this.M = new M();
    }
})();
