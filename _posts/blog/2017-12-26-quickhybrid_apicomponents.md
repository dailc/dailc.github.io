---
layout:     post
title:      【quickhybrid】组件（自定义）API的实现
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: 组件（自定义）API的实现
---

## 前言

前文在API规划时就已经有提到过组件API这个概念，本文将会介绍它的原理以及实现

## 理解组件API这个概念

```js
quick.ui.xxx
quick.page.xxx
```

在quick hybrid中，API是按模块划分的，如`ui`，`page`等都是不同模块，而模块的另一个名称则是`组件`

为什么叫组件？可以这样理解，模块更多的是H5前端的叫法（因为在前端看来不同API分别属于不同的模块下），
而组件则是原生那边加强的理解概念（因为，每一个组件都是可以在项目中单独存在的，譬如项目A中有组件`pay`，但项目B却不一定集成有）

### 框架API和组件API

回到最初，quick hybrid的使命就是服务于N个项目，那么会遇到一个问题-__N个项目中可能会有非常多的需要以API方式提供的需求，但是考虑到体积以及通用性，并不是所有的都适合直接集成到框架中__

此时，就需要对框架内容和项目内容进行区分，于是就有了框架API和组件API的概念（此时可以认为原生中框架文件是单独打成一个静态包给项目引用的，项目无法直接修改）

![](https://quickhybrid.github.io/staticresource/images/quick_apicomponents.png)

__框架API__

- 直接打包到框架文件中（前端的`quick.native.js`，原生框架包中的API都会包含）

- 使用的时候直接`quick.xx模块.xx功能`即可调用（因为前端会将框架API都默认封装）

- `config`配置时无需单独注册（因为默认情况会注册好）

- 部分框架API会有H5下的实现（如部分系统级API都是有H5下的实现的）

__组件API__

- 框架中不会包含，由各自的项目自行开发或集成（如某项目单独集成一个个性化语音组件）

- 使用的时候必须用`quick.callAPi(...)`并传入合适参数（因为框架不会集成，需要通过这个万金油方法调用）

- `config`配置时必须注册（需要传入组件别名注册，因为框架内部不知道这些新组件的）

- 所有组件API都只是quick环境下的实现（一般都是一些原生中集成的拓展功能）

![](https://quickhybrid.github.io/staticresource/images/quick_apicomponents2.png)

## 项目中如何拓展组件API

项目中默认只会打包框架API，但是框架的功能是有限的（只会集成一些最常用的功能），如果遇到一些个性化的需求（如支付，语音等等），则需要项目拓展组件API，总体步骤如下：

- 1.原生引入框架，并实现对应的API接口，编写API的功能代码

- 2.原生在项目配置文件中（不是框架配置文件）声明对应的别名和路径关系

- 3.H5页面初始化时，`config`，并传入对应需要注册的组件的别名

- 4.容器接收到config方法后，去配置文件中根据别名找路径，然后注册对应路径下的API类

- 5.注册成功后，H5页面中通过`callAPi`来调用新注册的组件API

### 原生实现API接口

原生中API的定义如下（以pay组件为示例）

__Android中__

```js
public class PayApi implements IBridgeImpl {

     public static void payCustom(..., JSONObject param, final Callback callback) {
        // 做对应的支付工作，做完后回调
        ...
        callback.apply(...);
    }
}
```

__iOS中__

```js
@implementation PayApi
- (void)registerHandlers {
    [self registerHandlerName:@"payCustom" handler:^(id data, WVJBResponseCallback responseCallback) {
        // 做对应的支付工作，做完后回调
        ...
        responseCallback(...);
    }];
}
```

### 声明别名与路径的关系

需要注意的是，Android和iOS中别名请保持一致，一般情况下键值对也可

譬如以示例项目为例，

Android在`app`模块下的`assets/modules.properties`中

```js
pay = com.quick.quickhybrid.api.PayApi
...
```

同理iOS中也类似，只不过右侧的路径值可以换为iOS中的，如

```js
pay = PayApi
```

可以看到，Android和iOS中的别名名称相同，但是路径不一致（因为各种的包机制不一样）

### H5中config注册

H5中需要在config注册拓展的组件，需要传入别名（别名有对应的文档说明-一般情况下同类型组件的别名是固定的）

```js
quick.config({
   jsApiList: ['pay']
});

// error代表发生错误
quick.error(...);

// ready中是注册成功
quick.ready(...);
```

### 原生容器注册组件API

原生容器接收到config请求后就开始注册组件，如下

```js
// RegisterName: ui,page,pay之类的组件（模块）名
// RegisterNclass: 对应的路径，Android中和iOS中不一致

// RegisterNclass: 如com.quick.quickhybrid.api.PayApi
JSBridge.register(RegisterName, RegisterNclass);
```

```js
// RegisterNclass: 如PayApi
[self registerHandlersWithClassName:@"RegisterNclass" moduleName:@"RegisterName"];
```

### H5中调用组件API

注册成功后，H5中通过特定方法调用

```js
quick.callApi({
    name: 'testPay',
    mudule: 'pay',
    // 额外参数经常都需要
    data: {...},
    success: function(result) {
        quick.ui.toast(JSON.stringify(result));
    },
    error: function(error) {},
});
```

## 结束语

实际情况下，当项目足够多时，拓展组件API是一种非常常见的场景，因此制定规范是很有必要的。

另外，一般情况下，很多相同功能的组件都是可以一起积累，多个项目复用的（比如支付，特定业务组件等等）

## 返回根目录

- [【quickhybrid】如何实现一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)

