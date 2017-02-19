---
layout:     post
title:      Hybrid APP基础篇(四)->JSBridge实现原理与示例
category: blog
tags: Hybrid
favour: Hybrid
description: JSBridge实现原理与示例。包括了相应的示例实现项目源码。
---


## 前言

### 写在前面的话

**20170219更新**
将稿子重新整理成MD形式了

**20161004更新**
初稿发布

### 前置文章
阅读本文之前，建议先阅读下列前置文章

* [Hybrid APP基础篇(三)->Hybrid APP之Native和H5页面交互原理](https://dailc.github.io/2016/10/04/hybridBase03NativeAndH5Interaction.html)

### 楔子
上文中简单的介绍了JSBridge,以及为什么要用JSBridge,本文详细介绍它的实现原理

## 原理概述

### 简介
JSBridge是Native代码与JS代码的通信桥梁。目前的一种统一方案是:H5触发url scheme->Native捕获url scheme->原生分析,执行->原生调用h5。如下图

![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_1.png)

### url scheme介绍
上图中有提到url scheme这个概念,那这到底是什么呢?

* url scheme是一种类似于url的链接,是为了方便app直接互相调用设计的
	* 具体为,可以用系统的OpenURI打开一个类似于url的链接(可拼入参数),然后系统会进行判断,如果是系统的url scheme,则打开系统应用,否则找看是否有app注册这种scheme,打开对应app
	* 需要注意的是,这种scheme必须原生app注册后才会生效,如微信的scheme为(weixin://)
* 而本文JSBridge中的url scheme则是仿照上述的形式的一种方式
	* 具体为,app不会注册对应的scheme,而是由前端页面通过某种方式触发scheme(如用iframe.src),然后Native用某种方法捕获对应的url触发事件,然后拿到当前的触发url,根据定义好的协议,分析当前触发了那种方法,然后根据定义来执行等
* **注意，iOS10以后，urlscheme必须符合url规范，否则会报错**	

## 实现流程
基于上述的基本原理,现在开始设计一种JSBridge的实现

### 实现思路
要实现JSBridge,我们可以进行关键步骤分析

* 第一步:设计出一个Native与JS交互的全局桥对象
* 第二步:JS如何调用Native
* 第三步:Native如何得知api被调用
* 第四步:分析url-参数和回调的格式
* 第五步:Native如何调用JS
* 第六步:H5中api方法的注册以及格式

如下图:
![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_3.png)

### 第一步:设计出一个Native与JS交互的全局桥对象
我们规定,JS和Native之间的通信必须通过一个H5全局对象JSbridge来实现,该对象有如下特点

* 该对象名为"JSBridge",是H5页面中全局对象window的一个属性
	`var JSBridge = window.JSBridge || (window.JSBridge = {});`
* 该对象有如下方法
	* `registerHandler(String,Function)` H5调用,注册本地JS方法,注册后Native可通过JSBridge调用。调用后会将方法注册到本地变量`messageHandlers` 中
	* `callHandler(String,JSON,Function)` H5调用,调用原生开放的api,调用后实际上还是本地通过url scheme触发。调用时会将回调id存放到本地变量`responseCallbacks`中
	* `_handleMessageFromNative(JSON)` Native调用,原生调用H5页面注册的方法,或者通知H5页面执行回调方法
* 如图
	* ![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_2.png) 

### 第二步:JS如何调用Native
在第一步中,我们定义好了全局桥对象,可以我们是通过它的callHandler方法来调用原生的,那么它内部经历了一个怎么样的过程呢？如下

#### callHandler函数内部实现过程
在执行callHandler时,内部经历了以下步骤:

* (1)判断是否有回调函数,如果有,生成一个回调函数id,并将id和对应回调添加进入回调函数集合`responseCallbacks`中
* (2)通过特定的参数转换方法,将传入的数据,方法名一起,拼接成一个url scheme
	
	```
//url scheme的格式如
//基本有用信息就是后面的callbackId,handlerName与data
//原生捕获到这个scheme后会进行分析
var uri = CUSTOM_PROTOCOL_SCHEME://API_Name:callbackId/handlerName?data
	```	
* (3)使用内部早就创建好的一个隐藏iframe来触发scheme
	
	```
//创建隐藏iframe过程
var messagingIframe = document.createElement('iframe');
messagingIframe.style.display = 'none';
document.documentElement.appendChild(messagingIframe);

//触发scheme
messagingIframe.src = uri;	
	```
	* 注意,正常来说是可以通过window.location.href达到发起网络请求的效果的，但是有一个很严重的问题，就是如果我们连续多次修改window.location.href的值，在Native层只能接收到最后一次请求，前面的请求都会被忽略掉。所以JS端发起网络请求的时候，需要使用iframe，这样就可以避免这个问题。

### 第三步:Native如何得知api被调用
在上一步中,我们已经成功在H5页面中触发scheme,那么Native如何捕获scheme被触发呢？

根据系统不同,Android和iOS分别有自己的处理方式

#### Android捕获url scheme
在Android中(WebViewClient里),通过`shouldoverrideurlloading`可以捕获到url scheme的触发	

```
public boolean shouldOverrideUrlLoading(WebView view, String url){
	//读取到url后自行进行分析处理
	
	//如果返回false，则WebView处理链接url，如果返回true，代表WebView根据程序来执行url
	return true;
}
```

另外,Android中也可以不通过iframe.src来触发scheme,android中可以通过<code>window.prompt(uri, "");</code>来触发scheme,然后Native中通过重写WebViewClient的`onJsPrompt`来获取uri

#### iOS捕获url scheme
iOS中,UIWebView有个特性：在UIWebView内发起的所有网络请求，都可以通过delegate函数在Native层得到通知。这样,我们可以在webview中捕获url scheme的触发(原理是利用 shouldStartLoadWithRequest)

```
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSURL *url = [request URL];
     
    NSString *requestString = [[request URL] absoluteString];
    //获取利润url scheme后自行进行处理
```

之后Native捕获到了JS调用的url scheme,接下来就该到下一步分析url了

### 第四步:分析url-参数和回调的格式
在前面的步骤中,Native已经接收到了JS调用的方法,那么接下来,原生就应该按照定义好的数据格式来解析数据了

url scheme的格式,前面已经提到。Native接收到Url后,可以按照这种格式将回调参数id、api名、参数提取出来,然后按如下步骤进行

* (1)根据api名,在本地找寻对应的api方法,并且记录该方法执行完后的回调函数id
* (2)根据提取出来的参数,根据定义好的参数进行转化
	* 如果是JSON格式需要手动转换,如果是String格式直接可以使用
* (3)原生本地执行对应的api功能方法
* (4)功能执行完毕后,找到这次api调用对应的回调函数id,然后连同需要传递的参数信息,组装成一个JSON格式的参数
	* 回调的JSON格式为:`{responseId:回调id,responseData:回调数据}`
	* `responseId String型` H5页面中对应需要执行的回调函数的id,在H5中生成url scheme时就已经产生
	* `responseData JSON型` Native需要传递给H5的回调数据,是一个JSON格式: `{code:(整型,调用是否成功,1成功,0失败),result:具体需要传递的结果信息,可以为任意类型,msg:一些其它信息,如调用错误时的错误信息}`
* (5)通过JSBridge通知H5页面回调
	* 参考 `第五步Native如何调用JS`

### 第五步:Native如何调用JS
到了这一步,就该Native通过JSBridge调用H5的JS方法或者通知H5进行回调了,具体如下

```
//将回调信息传给H5
JSBridge._handleMessageFromNative(messageJSON);	
```

如上,实际上是通过JSBridge的_handleMessageFromNative传递数据给H5,其中的messageJSON数据格式根据两种不同的类型,有所区别,如下

#### Native通知H5页面进行回调
数据格式为:`上文中的回调的JSON格式`

#### Native主动调用H5方法
Native主动调用H5方法时,数据格式是:`{handlerName:api名,data:数据,callbackId:回调id}`

* `handlerName String型` 需要调用的,h5中开放的api的名称
* `data JSON型` 需要传递的数据,固定为JSON格式(因为我们固定H5中注册的方法接收的第一个参数必须是JSON,第二个是回调函数)

注意,这一步中,如果Native调用的api是h5没有注册的,h5页面上会有对应的错误提示。

另外,H5调用Native时,Native处理完毕后一定要及时通知H5进行回调,要不然这个回调函数不会自动销毁,多了后会引发内存泄漏。

### 第六步:H5中api方法的注册以及格式
前面有提到Native主动调用H5中注册的api方法,那么h5中怎么注册供原生调用的api方法呢？格式又是什么呢?如下

#### H5中注册供原生调用的API

```
//注册一个测试函数
JSBridge.registerHandler('testH5Func',function(data,callback){
	alert('测试函数接收到数据:'+JSON.stringify(data));
	callback&&callback('测试回传数据...');
});	
```

如上述代码为注册一个供原生调用的api

#### H5中注册的API格式注意
如上代码,注册的api参数是`(data,callback)`

其中第一个data即原生传过来的数据,第二个callback是内部封装过一次的,执行callback后会触发url scheme,通知原生获取回调信息

## 进一步完善JSBridge方案
在前文中,已经完成了一套JSBridge方案,这里,在介绍下如何完善这套方案

### 思路
github上有一个开源项目,它里面的JSBridge做法在iOS上进一步优化了,所以参考他的做法,这里进一步进行了完善。地址[github-WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)

大致思路就是

* h5调用Native的关键步骤进行拆分,由以前的直接传递url scheme变为传递一个统一的url scheme,然后Native主动获取传递的参数
	* 完善以前: H5调用Native->将所有参数组装成为url scheme->原生捕获scheme,进行分析
	* 完善以后: H5调用Native->将所有参数存入本地数组->触发一个固定的url scheme->原生捕获scheme->原生通过JSBridge主动获取参数->进行分析

### 实现
这种完善后的流程和以前有所区别,如下

#### JSBridge对象图解
![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_4.png)

####　JSBridge实现完整流程
![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_5.png)

#### 注意
由于这次完善的核心是:Native主动调用JS函数,并获取返回值。而在Android4.4以前,Android是没有这个功能的,所以并不完全适用于Android

所以一般会进行一个兼容处理,Android中采用以前的scheme传法,iOS使用完善后的方案(也便于4.4普及后后续的完善)

## 完整的JSBridge
上述分析了JSBridge的实现流程,那么实际项目中,我们就应该结合上述两种,针对Android和iOS的不同情况,统一出一种完整的方案,如下

### 完整调用流程图
![](https://dailc.github.io/staticResource/blog/hybrid/jsbridge/img_hybrid_base_jsbridgePrinciple_6.png)

如上图,结合上述方案后有了一套统一JSBridge方案

### 另外实现:不采用url scheme方式
前面提到的JSBridge都是基于url scheme的,但其实如果不考虑Android4.2以下,iOS7以下,其实也可以用另一套方案的,如下

* Native调用JS的方法不变
* JS调用Native是不再通过触发url scheme,而是采用自带的交互,比如
* Android中,原生通过 addJavascriptInterface开放一个统一的api给JS调用,然后将触发url scheme步骤变为调用这个api,其余步骤不变(相当于以前是url接收参数,现在变为api函数接收参数)
* iOS中,原生通过JavaScriptCore里面的方法来注册一个统一api,其余和Android中一样(这里就不需要主动获取参数了,因为参数可以直接由这个函数统一接收)

当然了,这只是一种可行的方案,多一种选择而已,具体实现流程请参考前面系列文章,本文不再赘述

## 实现示例

### 示例说明
本文中包括两个示例,一个是基础版本的JSBridge实现,一个是完整版本的JSBridge实现(包括JS,Android端实现等)。另外，这套方案是有iOS实践经验的，可以仿照着Android端编码(或者参考`WebViewJavascriptBridge`这个示例)，例子里就暂时没有提供了。

### 实现源码

### 基础版本的JSBridge
这里只介绍JS的实现,具体Android,iOS实现请参考完整版本,实现如下

由于篇幅有限，已经移步到了github上 [https://github.com/dailc/hybrid_jsbridge_simple/blob/master/android/app/src/main/assets/JSbridge.js](https://github.com/dailc/hybrid_jsbridge_simple/blob/master/android/app/src/main/assets/JSbridge.js)

### 完整的实现示例
请参考下述示例，有完整的Andoid原生和H5端交互的示例。

[https://github.com/dailc/hybrid_jsbridge_simple](https://github.com/dailc/hybrid_jsbridge_simple)


## 附录

## 原文地址
原文在我个人博客上面
[Hybrid APP基础篇(四)->JSBridge实现原理](https://dailc.github.io/2016/10/04/hybridBase04JSbridgePrinciple.html)

### 参考来源

* [github-WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)
* [JSBridge-Web与Native交互之iOS篇](http://www.jianshu.com/p/9fd80b785de1)
* [Ios Android Hybrid app 与 Js Bridge](http://blog.csdn.net/jacin1/article/details/39993935)
* [Hybrid APP架构设计思路](http://www.tuicool.com/articles/yeeABzJ)
* [【Android】如何写一个JsBridge](http://www.cnblogs.com/xesam/p/5402985.html)
* [IOS之URL Scheme的使用](http://blog.csdn.net/wbw1985/article/details/26264029)