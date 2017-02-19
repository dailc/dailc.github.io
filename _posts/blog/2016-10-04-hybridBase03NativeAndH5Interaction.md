---
layout:     post
title:      Hybrid APP基础篇(三)->Hybrid APP之Native和H5页面交互原理
category: blog
tags: Hybrid
favour: Hybrid
description: Hybrid APP之Native和H5页面交互原理。介绍H5页面和原生交互的几种方式。
---


## 前言

### 前置文章
阅读本文之前，建议先阅读下列前置文章

* [Hybrid APP基础篇(一)->什么是Hybrid App](https://dailc.github.io/2016/10/04/hybridBase01HybridInfo.html)

### 楔子
Hybrid APP的关键是原生页面与H5页面直接的交互,本文做简单介绍

## Android、iOS原生和H5的基本通信机制
在Hybrid APP中,原生与H5的交互方式在Android和iOS上的实现是有异同的,原因是Android、iOS的通信机制有所区别,下面介绍原生和H5相互调用的方法

### Android端

#### Native调JS
4.4版本之前

```
// mWebView = new WebView(this); //即当前webview对象			
mWebView.loadUrl("javascript: 方法名('参数,需要转为字符串')"); 

//ui线程中运行
 runOnUiThread(new Runnable() {  
        @Override  
        public void run() {  
            mWebView.loadUrl("javascript: 方法名('参数,需要转为字符串')");  
            Toast.makeText(Activity名.this, "调用方法...", Toast.LENGTH_SHORT).show();  
        }  
});  
```

4.4以后(包括4.4)

```
//异步执行JS代码,并获取返回值	
mWebView.evaluateJavascript("javascript: 方法名('参数,需要转为字符串')", new ValueCallback<String>() {
        @Override
        public void onReceiveValue(String value) {
    		//这里的value即为对应JS方法的返回值
        }
});
```

如上所示,Native用H5页面中的JS方法,有如下特点

* 4.4之前Native通过loadUrl来调用JS方法,只能让某个JS方法执行,但是无法获取该方法的返回值
* 4.4之后,通过evaluateJavascript异步调用JS方法,并且能在onReceiveValue中拿到返回值
* 不适合传输大量数据(大量数据建议用接口方式获取)
* mWebView.loadUrl("javascript: 方法名('参数,需要转为字符串')");函数需在UI线程运行，因为mWebView为UI控件(但是有一个坏处是会阻塞UI线程)

#### JS调Native

```
 WebSettings webSettings = mWebView.getSettings();  
 //Android容器允许JS脚本，必须要
webSettings.setJavaScriptEnabled(true);
//Android容器设置侨连对象
mWebView.addJavascriptInterface(getJSBridge(), "JSBridge");
```

Android中JSBridge的代码

```
//Android4.2版本以上，本地方法要加上注解@JavascriptInterface，否则会找不到方法。
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

Html中JS调用原生的代码

```
//调用方法一
window.JSBridge.foo(); //返回:'foo'
//调用方法二
window.JSBridge.foo2('test');//返回:'foo2:test'
```

如上所示,Native中通过addJavascriptInterface添加暴露出来的JS桥对象,然后再该对象内部声明对应的API方法,有如下特点:

* 在Android4.2以上(api17后),暴露的api要加上注解@JavascriptInterface，否则会找不到方法。
* 在api17以前,addJavascriptInterface有风险,hacker可以通过反编译获取Native注册的Js对象，然后在页面通过反射Java的内置静态类，获取一些敏感的信息和破坏
	* 所以,也就是为什么Android中也会使用JSBridge来进行交互,而不是addJavascriptInterface直接暴露api
* JS能调用到已经暴露的api,并且能得到相应返回值

### iOS端

#### Native调JS

```
//可以取得JS函数执行的返回值
//方法必须是Html页面绑定在最顶层的window上对象的
//如window.top.foo
//Swift
webview.stringByEvaluatingJavaScriptFromString("方法名(参数)")
//OC
[webView stringByEvaluatingJavaScriptFromString:@"方法名(参数);"];
```

如上所示,Native通过stringByEvaluatingJavaScriptFromString调用Html绑定在window上的函数,有如下特点

* Native调用JS方法时,能拿到JS方法的返回值
* 不适合传输大量数据(大量数据建议用接口方式获取)

#### JS调Native
引入官方的库文件

```
#import <JavaScriptCore/JavaScriptCore.h>	
```

Native注册api函数(OC)

```
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

Html中JS调用原生的代码

``
//调用方法,用top是确保调用到最顶级,因为iframe要用top才能拿到顶级
window.top.foo('test'); //返回:'foo:test'
``

如上所示,Native中通过引入官方提供的JavaScriptCore库(iOS7中出现的),然后可以将api绑定到JSContext上(然后Html中JS默认通过window.top.***可调用)。有如下特点

* iOS7才出现这种方式,在这之前,js无法直接调用Native,只能通过JSBridge方式简介调用
* JS能调用到已经暴露的api,并且能得到相应返回值
* iOS原生本身是无法被JS调用的,但是通过引入官方提供的第三方"JavaScriptCore",即可开放api给JS调用

## 原生和H5的另一种通讯方式:JSBridge
实际上,Native与H5通信,除了前面提到的用基本方法外,还有一种广为流行的方法:JSBridge

### 什么是JSBridge
JSBridge是广为流行的Hybrid开发中JS和Native一种通信方式,各大公司的应用中都有用到这种方法

简单的说,JSBridge就是定义Native和JS的通信,Native只通过一个固定的桥对象调用JS,JS也只通过固定的桥对象调用Native,基本原理是:

H5->通过某种方式触发一个url->Native捕获到url,进行分析->原生做处理->Native调用H5的JSBridge对象传递回调。如下图

![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_1.png)

上图简单的介绍了下JSBridge的核心原理,具体详细实现请参考后面详解。

### 为什么要用JSBridge
在上文中我们有提到Native和原生之间的基本通信,既然Native和原生已经能够实现通信了,那为什么还要这种通过url scheme的JSBridge方式呢,原因大致如下

* Android4.2以下,addJavascriptInterface方式有安全漏掉
* iOS7以下,JS无法调用Native
* url scheme交互方式是一套现有的成熟方案,可以完美兼容各种版本,不存在上述问题

另外,请注意,可以理解为JSBridge是一种交互理念,而上述的url scheme则是其中的一种实现,所以也就是说,就算后面实现变为了addJavascriptInterface,JavaScriptCore,也一样是JSBridge交互

JSBridge交互的一个很大特点就是便于拓展,而且没有重大的安全性问题,所以也就是为什么它广为流行

### JSBridge原理以及实现
JSBridge的原理和实现请参考 [Hybrid APP基础篇(四)->JSBridge实现原理](https://dailc.github.io/2016/10/04/hybridBase04JSbridgePrinciple.html)



## 附录

### 参考来源

* [JSBridge-Web与Native交互之iOS篇](http://www.jianshu.com/p/9fd80b785de1)
* [Ios Android Hybrid app 与 Js Bridge](http://blog.csdn.net/jacin1/article/details/39993935)
* [Hybrid APP架构设计思路](http://www.tuicool.com/articles/yeeABzJ)
* [Android4.2下 WebView的addJavascriptInterface漏洞解决方案](http://blog.csdn.net/zhouyongyang621/article/details/47000041)
* [WebView---Android与js交互实例](http://blog.csdn.net/it1039871366/article/details/46372207)