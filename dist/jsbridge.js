/*!
 * Name: jsbridge - bridge for IOS&Android
 * Repository: https://github.com/90Team/jsbridge
 * Author: Liweifeng
 */
!(function () {

    //返回浏览器信息
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


    //JS Bridge 桥梁构建
    var UA = navigator.userAgent,
        client = new Client('Meishizhaoshi', UA);


    var Bridge = function(){
        this.inapp = client.version || false;
        this.handler = null;
        if( this.inapp ){
            this.handler = function(callback) {
                if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
                if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
                window.WVJBCallbacks = [callback];
                var WVJBIframe = document.createElement('iframe');
                WVJBIframe.style.display = 'none';
                WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
                document.documentElement.appendChild(WVJBIframe);
                setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
            };
        }else{
            
        }
    };

    Bridge.prototype.on = function(){
        var args = [].slice.call(arguments);
        this.handler(function(bridge){
            bridge.registerHandler.apply(this.handler, args);
        });
    };

    Bridge.prototype.trigger = function(){
        var args = [].slice.call(arguments);
        this.handler(function(bridge){
            bridge.callHandler.apply(this.handler, args);
        });
    };

    //柯理化
    function currying(fn) {
        var args = [].slice.call(arguments, 1);
        return function() {
            var _args = args.concat([].slice.call(arguments));
            return fn.apply(_args, _args);
        };
    };

    //暴露接口
    var bridge = new Bridge();
    bridge.client = client;
    bridge.isAndroid = UA.indexOf('Android') > -1 || UA.indexOf('Adr') > -1;
    bridge.isiOS = !!UA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

    // RequireJS && SeaJS
    if (typeof define === 'function') {
        define(function() {
            return bridge;
        });

    // NodeJS
    } else if (typeof exports !== 'undefined') {
        module.exports = null;
        
    // Bowser
    } else {
        this.bridge = bridge;
    }
})();
