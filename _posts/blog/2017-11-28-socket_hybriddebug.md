---
layout:     post
title:      基于socket.io打造hybrid调试页面
category: blog
tags: websocket 工具
favour: websocket
description: 基于socket.io打造hybrid调试页面，PC端编写代码，Hybrid端执行
---

## 前言

参考的[钉钉调试页面](https://wsdebug.dingtalk.com/?spm=a219a.7629140.0.0.BHzRGr)实现，仅供学习！

功能为：

__PC端编写代码，手机端执行__

解决的痛点是：

__避免了调试`hybrid`应用时重复写各种测试页面__

## 源码与示例

__源码__

[https://github.com/dailc/node-server-examples/tree/master/node-socketio-hybriddebug](https://github.com/dailc/node-server-examples/tree/master/node-socketio-hybriddebug)

__运行__

```js
1.`npm install`

2.`npm run serve`启动`node`服务

3.浏览器打开`./test/debugroom.html`页面

4.开始测试（浏览器直接打开或手机扫码）

注意，手机端链接请确保在同一个网段
```

注意⚠️，实际情况请重写`client`页面，让其支持对于`Hybrid`容器的API

__示例__

![image](http://upload-images.jianshu.io/upload_images/3437876-e57856c2b0457cef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image](http://upload-images.jianshu.io/upload_images/3437876-0030c8871cf57100.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 原理

原理其实非常简单，就是`HTML5`中的`websocket`，而且为了方便，还直接使用了成熟的第三方库`socket.io`

基本交互如下：

```js
1.先启动一个node后台（控制台），基于`express`和`socket.io`监听`socket`连接

2.打开一个PC端调试页面，连接后台，创建一个房间（可以创建N个房间）

3.PC端页面基于房间号生成对应房间的客户端地址（每一个房间中可以有`N`个客户端），并基于地址创建二维码，方便使用（可以基于`qrcode.js`等库）

4.`Hybrid`客户端扫码后（或者打开客户端链接后），客户端页面连接后台，根据当前的房间号，在房间中创建客户端

5.PC端输入代码后，点击执行时，会将代码文本发送到后台，然后后台再推送给客户端，客户端通过`eval`即可执行这段代码，执行完毕后也可通过同样方式通知PC端
```

需要注意的是：

- 服务端是引用的`npm`的`socket.io`包

- 客户端是引用[socket.io-client](https://github.com/socketio/socket.io-client)项目中发布的`socket.io.js`文件

另外：

- 后台程序直接基于`es6`语法编写的，然后基于`gulp`打包成`dest`文件，实际运行的是`dest`中的发布文件，代码规范接近与`airbnb`

- 前端页面的话比较随意，样式还大量用了钉钉原本的样式，也没有考虑各种浏览器的兼容

- 为什么说是`hybrid`调试页面？因为打造它的核心需求就是用来调试`hybrid`API

## 步骤

由于篇幅关系（也没有必要），并不会将所有代码都介绍一遍，只会介绍一些重点步骤，更多的可以直接阅读源码（源码中已经足够清晰）

### 设计`DebugRoom`（PC端）和`DebugClient`（`hybrid`端）

根据交互，PC端和hybrid端都需要和后台连接，因此这里直接单独封装了两个类

__DebuRoom类__

房间的定义是：

- 只有一个`socket`引用

- 有一个房间`id`标识

- 房间内可以管理客户端（增，删，查）

```js
class DebugRoom {
    // 所属的房间号
    this._roomId
    // 所持有的socket对象
    this._socket
    // 客户端持有默认是一个空对象，key是clientid，value是client
    this._clients
    
    id()
    clients()
    socket()
    getClientsCount()
    removeClient(client)
    addClient(client)
    clearClients()
}
```

__DebugClient类__

客户端的定义是：

- 只有一个`socket`引用

- 有一个客户端`id`标识

- 有一个房间`id`引用，指向对于的房间号（当然其实也可以是引用`DebugRoom`对象的）

```js
class DebugClient {
    // 所属的房间号
    this._roomId
    // 客户端id
    this._clientId
    // 所持有的socket对象
    this._socket
    
    id()
    roomId()
    socket()
}
```

### 设计一些交互接口

前后端交互通过`socket.io`中定义的事件来，以下是房间以及客户端和后台的交互事件接口

__通用交互事件__

后台：

```js
// 后台监听连接，每有一个连接时（前端通过`io.connect`），会通知客户端触发'open'事件
io.on('connection', ...)

// 后台监听关闭连接，每当连接关闭时（前端直接关闭或调用`socket.disconnect`），会检测本地房间与客户端，如果关闭的是客户端，则移除这个客户端，对于的房间下的引用也置空，否则如果是房间，移除并关闭房间内所有的客户端
io.on('disconnect', ...)
```

房间与客户端：

```js
// 前台监听打开事件，此时，如果是房间，则会通知后台触发'create room'，否则通知后台触发'create client'
socket.on('open', ...)

// 前台监听连接是否关闭
socket.on('disconnect', ...)
```

__房间与后台交互事件__

后台：

```js
// 监听创建房间，如果房间ID合法，则会创建一个新的房间（new DebugRoom）
io.on('create room', ...)
// 监听房间分发数据，并且将数据转发给房间内的所有客户端，通知客户端触发'receive dispatch data'事件
io.on('dispatch data', ...)
```

房间：

```js
// 监听客户端创建，每一个客户端加入对应房间时都会通知这个房间
socket.on('client created', ...)
// 监听客户端关闭，每一个客户端退出时都会通知这个房间
socket.on('client destroy', ...)
// 监听客户端执行，客户端每执行一次分发数据时，都会通知房间是否执行成功
socket.on('client excuted', ...)
```

__客户端与后台交互事件__

后台：

```js
// 监听客户端创建，如果房间已存在，并且客户端id合法，才会正常创建，创建完后会通知房间触发'client created'事件
io.on('create client', ...)
// 监听客户端响应执行，客户端执行一次分发数据后，会通知后台，后台接收到这个事件后，通知房间触发'client excuted'事件
io.on('client excute notify', ...)
```

客户端：

```js
// 监听接收分发数据，接收完后会执行数据中的代码，并且通知后台是否执行成功，触发后台的'client excute notify'事件
socket.on('receive dispatch data', ...)
```

### 一些逻辑上的细节

以上流程就是整套程序的基本思路与交互，这里再补充一些交互细节

- 用全局的`roomsHash`和`clientsHash`缓存住所有的房间和客户端，方便直接查询

- 每次创建时，`id`可以直接绑定在对于的`socket`中，这样更方便

- 房间和客户端`id`最好不要直接使用，可以进过一次编码（这样可以直接使用中文）

- 客户端失联时，一定要先判断房间是否以及销毁，不要重复操作

- 失去连接后，缓存中的引用要及时清除

更多源码请参考[https://github.com/dailc/node-server-examples/tree/master/node-socketio-hybriddebug](https://github.com/dailc/node-server-examples/tree/master/node-socketio-hybriddebug)


## 附录

### 参考资料

- [socket.io/docs](https://socket.io/docs/)

- [钉钉JSAPI控制台](https://wsdebug.dingtalk.com/?spm=a219a.7629140.0.0.BHzRGr)