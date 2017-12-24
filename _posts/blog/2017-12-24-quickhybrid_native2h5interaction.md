---
layout:     post
title:      【quickhybrid】H5和Native交互原理
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: H5和Native交互原理
---

## 前言

`Hybrid`架构的核心就是`JSBridge`交互，而实现这个交互的前提是弄清楚H5和Native端的交互

本文主要介绍Native端（Android/iOS）和H5端（泛指前端）的交互原理
（之前也整理过类似的文章，本系列重新梳理）

## `Native`与`H5`交互的两种方式

原生和前端的交互有两种方式：`url scheme`以及`JavaScriptCore`（在Android中是`addJavascriptInterface`）

url scheme适用于所有的系统设备（低版本Android和低版本iOS都适用）

但是url scheme毕竟是通过url拦截实现的，在大量数据传输，以及效率上都有影响

另一种方法则在低版本中会有这样或那样的问题

如JavaScriptCore不支持`iOS7`以下，addJavascriptInterface在`4.2`以前有风险漏洞

当然了，时至今日，这些低版本造成的影响已经慢慢不再

## url scheme交互

这个是最广为流传的交互方式，起因是因为在hybrid刚出来时，很多低版本都需要兼容，因此几乎都用的这种

__一些概念：__

- 一般清空下，url scheme是一种类似于url的链接,是为了方便app直接互相调用设计的

    - 具体为,可以用系统的OpenURI打开一个类似于url的链接(可拼入参数),
    然后系统会进行判断,如果是系统的url scheme,则打开系统应用,
    否则找看是否有app注册这种scheme,打开对应app
    
    - 需要注意的是,这种scheme必须原生app注册后才会生效,如微信的scheme为(weixin://)

- 而本文中混合开发交互的url scheme则是仿照上述的形式的一种方式

    - 具体为,由前端页面通过某种方式触发scheme(如用iframe.src),
    然后Native用某种方法捕获对应的url触发事件,然后拿到当前的触发url,
    根据定义好的协议,分析当前触发了那种方法,然后根据定义来执行等
    
    - 协议类似于：`quickhybrid://xxx`
    
    - 一般这种交互的url没有必要在原生app配置中注册
    
- 注意⚠️： ️`iOS10`以后，urlscheme必须符合url规范，否则会报错，

__基本原理：__

```js
H5 -> 触发一个url（每一个功能代表的url都不同）-> Native端捕获到url

-> Native端分析属于哪一个功能并执行 -> Native端调用H5中的方法将执行结果回调给H5
```

如下图：

![](https://quickhybrid.github.io/staticresource/images/JSBridge_baseprinciple.png)

__相比于其它方案的优点：__

- Android4.2以下,addJavascriptInterface方式有安全漏掉

- iOS7以下,JavaScriptCore无法使用

所以如果需要兼容这类型低版本的机型，url scheme方案是不二选择

## H5直接与Native交互

分别包括Android，iOS中H5和原生互相调用，总结如下：

- H5调Android-原生通过`addJavascriptInterface`注册，然后H5直接调用

- Android调H5-原生通过`loadUrl`来调用H5，`4.4`及以上还可以通过`evaluateJavascript`调用

- H5调iOS-原生通过`JavaScriptCore`注册（需`ios7`以上），然后H5直接调用

- iOS调H5-通过`stringByEvaluatingJavaScriptFromString`

__H5调Android：__

首先，原生webview需要先注册可供前端调用的JS函数

```js
 WebSettings webSettings = mWebView.getSettings();  
 // Android容器允许JS脚本，必须要
webSettings.setJavaScriptEnabled(true);
// Android容器设置侨连对象
mWebView.addJavascriptInterface(getJSBridge(), "JSBridge");
```

```js
// Android4.2版本及以上，本地方法要加上注解@JavascriptInterface，否则会找不到方法。
private Object getJSBridge(){  
    Object insertObj = new Object(){  
        @JavascriptInterface
        public String foo(){  
            return "foo";  
        }  

        @JavascriptInterface
        public String foo2(final String param){  
            return "foo2:" + param;  
        }  

    };  
    return insertObj;  
}
```

然后H5中即可调用原生中注册的函数

```js
// 调用方法一
window.JSBridge.foo(); // 返回:'foo'
// 调用方法二
window.JSBridge.foo2('test'); // 返回:'foo2:test'
```

注意：

- 在Android`4.2`以上(api17后),暴露的api要加上注解`@JavascriptInterface`，否则会找不到方法。

- 在api17以前,addJavascriptInterface有风险,hacker可以通过反编译获取Native注册的Js对象，
然后在页面通过反射Java的内置静态类，获取一些敏感的信息和破坏

__Android调H5：__

在`4.4`版本之前

```js
// 即当前webview对象     
mWebView = new WebView(this);       
mWebView.loadUrl("javascript: 方法名('参数,需要转为字符串')"); 

// ui线程中运行
runOnUiThread(new Runnable() {  
        @Override  
        public void run() {  
            mWebView.loadUrl("javascript: 方法名('参数,需要转为字符串')");  
            Toast.makeText(Activity名.this, "调用方法...", Toast.LENGTH_SHORT).show();  
        }  
});
```

在`4.4`及以后（包括）

```js
// 异步执行JS代码,并获取返回值    
mWebView.evaluateJavascript("javascript: 方法名('参数,需要转为字符串')", new ValueCallback<String>() {
        @Override
        public void onReceiveValue(String value) {
            // 这里的value即为对应JS方法的返回值
        }
});
```

注意：

- 4.4之前Native通过loadUrl来调用JS方法,只能让某个JS方法执行,但是无法获取该方法的返回值

- 4.4及之后,通过evaluateJavascript异步调用JS方法,并且能在onReceiveValue中拿到返回值

- mWebView.loadUrl("javascript: 方法名('参数,需要转为字符串')");
函数需在UI线程运行，因为mWebView为UI控件(但是有一个坏处是会阻塞UI线程)

__H5调iOS：__

以`OC`为例

首先，需要引入`JavaScriptCore`库

```html
#import <JavaScriptCore/JavaScriptCore.h>
```

然后原生需要注册API

```js
//webview加载完毕后设置一些js接口
-(void)webViewDidFinishLoad:(UIWebView *)webView{
    [self hideProgress];
    [self setJSInterface];
}

-(void)setJSInterface{

    JSContext *context =[_wv valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];

    // 注册名为foo的api方法
    context[@"foo"] = ^() {

        //获取参数
        NSArray *args = [JSContext currentArguments];
        NSString *title = [NSString stringWithFormat:@"%@",[args objectAtIndex:0]];
        //做一些自己的逻辑
        //返回一个值  'foo:'+title
        return [NSString stringWithFormat:@"foo:%@", title];
    };
    
}
```

之后前端就可以调用了

```js
// 调用方法,用top是确保调用到最顶级,因为iframe要用top才能拿到顶级
window.top.foo('test'); // 返回:'foo:test'
```

注意：

- 引入官方提供的JavaScriptCore库(iOS7中出现的)，然后可以将api绑定到JSContext上
(然后Html中JS默认通过window.top.*（`iframe`中时需加`top`）可调用)

- iOS7之前，js无法直接调用Native,只能通过urlscheme方式间接调用

__iOS调H5：__

```js
// 可以取得JS函数执行的返回值
// 方法必须是Html页面绑定在最顶层的window上对象的
// 如window.top.foo
// Swift
webview.stringByEvaluatingJavaScriptFromString("方法名(参数)")
// OC
[webView stringByEvaluatingJavaScriptFromString:@"方法名(参数);"];
```

注意：

- Native调用JS方法时,能拿到JS方法的返回值

- 有iframe时，需要获取顶层窗口的引用

## 返回根目录

- [【quickhybrid】如何实现一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)
