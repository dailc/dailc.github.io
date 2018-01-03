---
layout:     post
title:      【quickhybrid】iOS端的项目实现
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: iOS端的项目实现
---

## 前言

18年元旦三天内和朋友突击了下，勉强是将雏形做出来了，后续的API慢慢完善。（当然了，主力还是那个朋友，本人只是初涉iOS，勉强能看懂，修修改改而已）

大致内容如下：

- JSBridge核心交互部分

- `ui`、`page`等部分常用API的实现（其它慢慢完善）

- 组件（自定义）API拓展的实现

- API的权限校验仅预留了一个入口，模拟最简单的实现

- 其它如离线资源加载更新，底层优化等机制暂时不提供

## 项目的结构

这个项目中，为了方便，就没有分成多个静态库了（事实上是可以这样做的），而是全部都放在一个项目中

整体目录结构如下：

```js
quickhybrid-ios
    |- AppDelegate          // 应用入口，分发进入对应的viewcontroller
    |- core                 // 核心工具类，放一些通用工具类
    |   |- ui
    |   |- util
    |   |- ...
    |- quickhybrid          // JSBridge实现的核心代码，定制viewcontroller，实现API等
    |   |- WebViewJavascriptBridge
    |   |- basecore
    |   |- quickcore
    |   |- api
```

![](https://quickhybrid.github.io/staticresource/images/project_structure_ios.png)

## 代码架构

和Android一样，仍然是简单的三次架构：`底层核心工具类->JSBridge桥接实现->app应用实现`

其中，core和jsbridge有必要的话可以打包成静态库

```js
core
    |- ui                           // 一些UI效果的定义与实现
    |- util                         // 通用工具类
    
quickhybird
    |- WebViewJavascriptBridge      // 第三方开源的jsbridge实现，里面进行了修改
    |- basecore                     // 定义基类viewcontroller
    |- quickcore                    // 定义quickhybrid中的viewcontroller实现
    |- api                          // 定义API，开放原生功能给H5
    
应用内
    |- AppDelegate                  // 应用入口，分发进入对应的viewcontroller
    |- MainViewController           // 入口界面
    |- TestPayApi                   // 定义的一个测试支付组件（自定义）API
    |- qhjsmodules.plist            // 内部定义模块的别名于路径关系的配置文件
```

## 权限配置

iOS可以直接在info.plist中配置权限，譬如

```js
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    <key>NSCameraUsageDescription</key>
    <string>是否允许应用使用摄像头？</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>是否允许应用使用定位功能</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>是否允许应用使用麦克风？</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>是否允许访问相册</string>
    <key>UIFileSharingEnabled</key>
    ...
```

## 应用配置

```js
Bundle Identifier: com.quickhybrid.quickhybriddemo
Version: 1.0.0

Deployment Target: 11.2（默认最新调试）
Devices: Universal

Signing: none
```

相比Android中一堆复杂的配置，iOS中无疑简单很多，直接用最新系统调试即可。。。

这里，到目前位置，这个项目还有很多API没有实现，后续预计是会引入部分静态库的。

当然，如果想要引入静态库，也很简单，直接如下：

```js
项目配置->Build Phases->Link Binary With Libraries->+（添加）->然后需要用到的地方import即可
```

整个过程非常的轻松愉快。

## 一些关键代码

代码方面，也无法一一全部说明，这里仅列举一些比较重要的步骤实现，其余可参考源码

### UA约定

前面的JS项目中就已经有提到UA约定，就是在加载对于webview时，统一在webview中加上如下UA标识

```js
// 获取默认UA
NSString *defaultUA = [[UIWebView new] stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
        
NSString *version = @"1.0.0";
        
NSString *customerUA = [defaultUA stringByAppendingString:[NSString stringWithFormat:@" QuickHybridJs/%@", version]];
        
[[NSUserDefaults standardUserDefaults] registerDefaults:@{@"UserAgent":customerUA}];
```

### 监听JSBridge的触发

在创建webview时，`QHBaseWebLoader`里创建代理监听

```js
    // 创建webView容器
    WKWebViewConfiguration *webConfig = [[WKWebViewConfiguration alloc] init];
    WKUserContentController *userContentVC = [[WKUserContentController alloc] init];
    webConfig.userContentController = userContentVC;
    WKWebView *wk = [[WKWebView alloc] initWithFrame:CGRectZero configuration:webConfig];
    
    [self.view addSubview:wk];
    self.wv = wk;
    self.wv.navigationDelegate = self;
    self.wv.UIDelegate = self;
    self.wv.translatesAutoresizingMaskIntoConstraints = NO;
    
    ...  
    
    self.bridge = [WKWebViewJavascriptBridge bridgeForWebView:self.wv];
    [self.bridge setWebViewDelegate:self];
    
    [self.wv.configuration.userContentController addScriptMessageHandler:self.bridge name:@"WKWebViewJavascriptBridge"];
```

然后`h5`中通过以下调用：

```js
window.webkit.messageHandlers.WKWebViewJavascriptBridge.postMessage(...);
```

然后`WKWebViewJavascriptBridge`内部，接受传递的信息，并自行解析

```js
#pragma mark - WKScriptMessageHandler
- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if ([message.name isEqualToString:@"WKWebViewJavascriptBridge"]) {
        [self excuteMessage:message.body];
    }
}
```

### 其它

iOS中还有一点和Android不同就是，很多标准的HTML5内容无需额外兼容（譬如fileinput文件选择等）

其它内容，和Android实现中提到的一样，这里就不再赘述了，可以直接参考源码

另外，后续如果继续有容器优化等操作，也会单独整理，加入本系列。

## 前端页面示例

为了方便，直接集成到了`res/`中，入口页面默认会加载它，也可以直接看源码

## 返回根目录

- [【quickhybrid】如何实现一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)
