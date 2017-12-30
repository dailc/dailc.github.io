---
layout:     post
title:      【quickhybrid】JS端的项目实现
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: JS端的项目实现
---

## 前言

API实现阶段之JS端的实现，重点描述这个项目的JS端都有些什么内容，是如何实现的。

不同于一般混合框架的只包含JSBridge部分的前端实现，本框架的前端实现包括JSBridge部分、多平台支持，统一预处理等等。

## 项目的结构

在最初的版本中，其实整个前端库就只有一个文件，里面只规定着如何实现JSBridge和原生交互部分。但是到最新的版本中，由于功能逐步增加，单一文件难以满足要求和维护，因此重构成了一整个项目。

整个项目基于`ES6`、`Airbnb代码规范`，使用`gulp + rollup`构建，部分重要代码进行了`Karma + Mocha`单元测试

整体目录结构如下：

```js
quickhybrid
    |- dist             // 发布目录
    |   |- quick.js
    |   |- quick.h5.js
    |- build            // 构建项目的相关代码
    |   |- gulpfile.js
    |   |- rollupbuild.js
    |- src              // 核心源码
    |   |- api          // 各个环境下的api实现 
    |   |   |- h5       // h5下的api
    |   |   |- native   // quick下的api
    |   |- core         // 核心控制
    |   |   |- ...      // 将核心代码切割为多个文件
    |   |- inner        // 内部用到的代码
    |   |- util         // 用到的工具类
    |- test             // 单元测试相关
    |   |- unit         
    |   |   |- karma.xxx.config.js
    |   |- xxx.spec.js
    |   |- ...
```

![](https://quickhybrid.github.io/staticresource/images/project_structure_js.png)

## 代码架构

项目代中将核心代码和API实现代码分开，核心代码相当于一个处理引擎，而各个环境下的不同API实现可以单独挂载（这里是为了方便其它地方组合不同环境下的API所以才分开的，实际上可以将native和核心代码打包到一起）

```js
quick.js
quick.h5.js
quick.native.js
```

这里需要注意，`quick.xx环境.js`中的代码是基于`quick.js`核心代码的（譬如里面需要用到一些特点的快速调用底层的方法）

而其中最核心的`quick.js`代码架构如下

```js
index
    |- os               // 系统判断相关
    |- promise          // promise支持，这里并没有重新定义，而是判断环境中是否已经支持来决定是否支持
    |- error            // 统一错误处理
    |- proxy            // API的代理对象，内部对进行统一预处理，如默认参数，promise支持等
    |- jsbridge         // 与native环境下原生交互的桥梁
    |- callinner        // API的默认实现，如果是标准的API，可以不传入runcode，内部默认采用这个实现
    |- defineapi        // API的定义，API多平台支撑的关键，也约定着该如何拓展
    |- callnative       // 定义一个调用通用native环境API的方法，拓展组件API（自定义）时需要这个方法调用
    |- init             // 里面定义config，ready，error的使用
    |- innerUtil        // 给核心文件绑定一些内部工具类，供不同API实现中使用
```

可以看到，核心代码已经被切割成很小的单元了，虽然说最终打包起来总共代码也没有多少，但是为了维护性，简洁性，这种拆分还是很有必要的

## 统一的预处理

在上一篇`API多平台的支撑`中有提到如何基于`Object.defineProperty`实现一个支持多平台调用的API，实现起来的API大致是这样子的

```js
Object.defineProperty(apiParent, apiName, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter() {
        // 确保get得到的函数一定是能执行的
        const nameSpaceApi = proxysApis[finalNameSpace];

        // 得到当前是哪一个环境，获得对应环境下的代理对象
        return nameSpaceApi[getCurrProxyApiOs(quick.os)] || nameSpaceApi.h5;
    },
    set: function proxySetter() {
        alert('不允许修改quick API');
    },
});

...

quick.extendModule('ui', [{
    namespace: 'alert',
    os: ['h5'],
    defaultParams: {
        message: '',
    },
    runCode(message) {
        alert('h5-' + message);
    },
}]);
```

其中`nameSpaceApi.h5`的值是`api.runCode`，也就是说直接执行`runCode(...)`中的代码

仅仅这样是不够的，我们需要对调用方法的输入等做统一预处理，因此在这里，我们基于实际的情况，在此基础上进一步完善，加上`统一预处理`机制，也就是

```js
const newProxy = new Proxy(api, apiRuncode);

Object.defineProperty(apiParent, apiName, {
    ...
    get: function proxyGetter() {
        ...
        return newProxy.walk();
    }
});
```

我们将新的运行代码变为一个代理对象`Proxy`，代理api.runCode，然后在get时返回代理过后的实际方法（`.walk()`方法代表代理对象内部会进行一次统一的预处理）

代理对象的代码如下

```js
function Proxy(api, callback) {
    this.api = api;
    this.callback = callback;
}

Proxy.prototype.walk = function walk() {
    // 实时获取promise
    const Promise = hybridJs.getPromise();

    // 返回一个闭包函数
    return (...rest) = >{
        let args = rest;

        args[0] = args[0] || {};
        // 默认参数的处理
        if (this.api.defaultParams && (args[0] instanceof Object)) {
            Object.keys(this.api.defaultParams).forEach((item) = >{
                if (args[0][item] === undefined) {
                    args[0][item] = this.api.defaultParams[item];
                }
            });
        }

        // 决定是否使用Promise
        let finallyCallback;

        if (this.callback) {
            // 将this指针修正为proxy内部，方便直接使用一些api关键参数
            finallyCallback = this.callback;
        }

        if (Promise) {
            return finallyCallback && new Promise((resolve, reject) = >{
                // 拓展 args
                args = args.concat([resolve, reject]);
                finallyCallback.apply(this, args);
            });
        }

        return finallyCallback && finallyCallback.apply(this, args);
    };
};
```

从源码中可以看到，这个代理对象统一预处理了两件事情：

- 1.对于合法的输入参数，进行默认参数的匹配

- 2.如果环境中支持Promise，那么返回Promise对象并且参数的最后加上`resolve`，`reject`

而且，后续如果有新的统一预处理（调用API前的预处理），只需在这个代理对象的这个方法中增加即可

## JSBridge解析规则

前面的文章中有提到JSBridge的实现，但那时其实更多的是关注原理层面，那么实际上，定义的交互解析规则是什么样的呢？如下

```js
// 以ui.toast实际调用的示例
// `${CUSTOM_PROTOCOL_SCHEME}://${module}:${callbackId}/${method}?${params}`
const uri = 'QuickHybridJSBridge://ui:9527/toast?{"message":"hello"}';

if (os.quick) {
    // 依赖于os判断
    if (os.ios) {
        // ios采用
        window.webkit.messageHandlers.WKWebViewJavascriptBridge.postMessage(uri);
    } else {
        window.top.prompt(uri, '');
    }
} else {
    // 浏览器
    warn(`浏览器中jsbridge无效, 对应scheme: ${uri}`);
}
```

原生容器中接收到对于的uri后反解析即可知道调用了些什么，上述中：

- `QuickHybridJSBridge`是本框架交互的scheme标识

- `module`和`method`分别代表API的模块名和方法名

- `params`是对于方法传递的额外参数，原生容器会解析成JSONObject

- `callbackId`是本次API调用在H5端的回调id，原生容器执行完后，通知H5时会传递回调id，然后H5端找到对应的回调函数并执行

为什么要用uri的方式，因为这种方式可以兼容以前的scheme方式，如果方案切换，变动代价下（本身就是这样升级上来的，所以没有替换的必要）

### UA约定

混合开发容器中，需要有一个UA标识位来判断当前系统。

这里Android和iOS原生容器统一在webview中加上如下UA标识（也就是说，如果容器UA中有这个标识位，就代表是quick环境-这也是os判断的实现原理）

```js
String ua = webview.getSettings().getUserAgentString();

ua += " QuickHybridJs/" + getVersion();

// 设置浏览器UA,JS端通过UA判断是否属于quick环境
webview.getSettings().setUserAgentString(ua);
```

```js
// 获取默认UA
NSString *defaultUA = [[UIWebView new] stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
        
NSString *version = [[NSBundle mainBundle].infoDictionary objectForKey:@"CFBundleShortVersionString"];
        
NSString *customerUA = [defaultUA stringByAppendingString:[NSString stringWithFormat:@" QuickHybridJs/%@", version]];
        
[[NSUserDefaults standardUserDefaults] registerDefaults:@{@"UserAgent":customerUA}];
        
```

如上述代码中分别在Android和iOS容器的UA中添加关键性的标识位。

## API内部做了些什么

API内部只做与本身功能逻辑相关的操作，这里有几个示例

```js
quick.extendModule('ui', [{
    namespace: 'toast',
    os: ['h5'],
    defaultParams: {
        message: '',
    },
    runCode(...rest) {
        // 兼容字符串形式
        const args = innerUtil.compatibleStringParamsToObject.call(this, rest, 'message', );
        const options = args[0];
        const resolve = args[1];
        
        // 实际的toast实现
        toast(options);
        options.success && options.success();
        resolve && resolve();
    },
}, ...]);
```

```js
quick.extendModule('ui', [{
    namespace: 'toast',
    os: ['quick'],
    defaultParams: {
        message: '',
    },
    runCode(...rest) {
        // 兼容字符串形式
        const args = innerUtil.compatibleStringParamsToObject.call(this, rest, 'message');

        quick.callInner.apply(this, args);
    },
}, ...]);
```

以上是toast功能在h5和quick环境下的实现，其中，在quick环境下唯一做的就是兼容了一个字符串形式的调用，在h5环境下则是完全的实现了h5下对应的功能（promise也需自行兼容）

为什么h5中更复杂？因为quick环境中，只需要拼凑成一个JSBridge命令发送给原生即可，具体功能由原生实现，而h5的实现是需要自己完全实现的。

另外，其实在quick环境中，上述还不是最少的代码（上述加了一个兼容调用功能，所以多了几行），最少代码如下

```js
quick.extendModule('ui', [{
    namespace: 'confirm',
    os: ['quick'],
    defaultParams: {
        title: '',
        message: '',
        buttonLabels: ['取消', '确定'],
    },
}, ...]);
```

可以看到，只要是符合标准的API定义，在quick环境下的实现只需要定义些默认参数就可以了，其它的框架自动帮助实现了（同样promise的实现也在内部默认处理掉了）

这样以来，就算是标准quick环境下的API数量多，实际上增加的代码也并不多。

## 关于代码规范与单元测试

项目中采用的`Airbnb代码规范`并不是`100%`契合原版，而是基于项目的情况定制了下，但是总体上`95%`以上是符合的

还有一块就是单元测试，这是很容易忽视的一块，但是也挺难做好的。这个项目中，基于`Karma + Mocha`进行单元测试，而且并不是测试驱动，而是在确定好内容后，对核心部分的代码都进行单测。
内部对于API的调用基本都是靠JS来模拟，对于一些特殊的方法，还需`Object.defineProperty(window.navigator, name, prop)`来改变window本身的属性来模拟。
本项目中的核心代码已经达到了`100%`的代码覆盖率。

具体的代码这里不赘述，可以参考源码

## 返回根目录

- [【quickhybrid】如何实现一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)
